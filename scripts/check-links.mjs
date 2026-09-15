/**
 * 参照リンクの死活監視。
 *
 * client/src/data/links.json を唯一の入力として全URLの到達性を確認し、結果を
 * client/src/data/link-health.json に記録します。連続して到達できなくなったリンクには
 * hidden を立て、UI（client/src/data/links.ts）が補助リンクを表示から自動的に外します。
 * 一時的な障害で消さないため、1回の判定につきリトライを行い、さらに連続失敗回数で判定します。
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(root, "client", "src", "data", "links.json");
const healthPath = path.join(root, "client", "src", "data", "link-health.json");

const requestTimeoutMs = clampInt(process.env.LINK_CHECK_TIMEOUT_MS, 25_000, 1_000, 120_000);
const attemptsPerLink = clampInt(process.env.LINK_CHECK_ATTEMPTS, 3, 1, 5);
const concurrency = clampInt(process.env.LINK_CHECK_CONCURRENCY, 4, 1, 8);
const userAgent =
  process.env.LINK_CHECK_USER_AGENT ??
  "Mozilla/5.0 (compatible; Fatigue-Index-Link-Monitor/1.0; +https://github.com/ohru131/Standard_Catalog)";

/** 環境変数由来の整数設定を検証します。数値でない場合は既定値、範囲外は上下限へ丸めます。 */
function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** タイムアウト付きで1リクエストを送ります。リダイレクトは追跡します。 */
async function request(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en;q=0.8",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 1つのURLの到達性を判定します。HEADを拒否するサイトが多いため、2xx以外はGETで確認し直します。
 * GETのレスポンスボディは読まないため、接続が保持されないよう破棄してから次へ進みます。
 */
async function probe(url) {
  let lastError = "";
  for (let attempt = 1; attempt <= attemptsPerLink; attempt += 1) {
    for (const method of ["HEAD", "GET"]) {
      try {
        const response = await request(url, method);
        const result = { ok: response.ok, httpStatus: response.status, finalUrl: response.url, method };
        await response.body?.cancel().catch(() => {});
        if (result.ok) return result;
        lastError = `HTTP ${result.httpStatus}`;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }
    if (attempt < attemptsPerLink) await wait(2000 * attempt);
  }
  return { ok: false, error: lastError || "到達できませんでした" };
}

const now = new Date().toISOString();
const registry = JSON.parse(await fs.readFile(registryPath, "utf8"));
const health = JSON.parse(await fs.readFile(healthPath, "utf8"));
health.links ??= {};

const links = registry.links ?? [];
if (links.length < 1) throw new Error("links.jsonから監視対象URLを読み込めませんでした。");
const threshold = clampInt(process.env.LINK_CHECK_FAIL_THRESHOLD, registry.policy?.hideAfterConsecutiveFailures ?? 2, 1, 12);

const requestedLimit = Number.parseInt(process.env.LINK_CHECK_LIMIT ?? "", 10);
const targets = Number.isFinite(requestedLimit) && requestedLimit > 0 ? links.slice(0, requestedLimit) : links;

const results = [];
for (let offset = 0; offset < targets.length; offset += concurrency) {
  const batch = targets.slice(offset, offset + concurrency);
  results.push(...(await Promise.all(batch.map(async (link) => ({ link, result: await probe(link.url) })))));
}

let ok = 0;
let broken = 0;
const newlyHidden = [];
const recovered = [];

for (const { link, result } of results) {
  // レジストリでURLを差し替えたリンクは、古いURLの失敗回数・非表示状態を引き継ぎません。
  const stored = health.links[link.id];
  const previous = stored?.url === link.url ? stored : {};
  if (result.ok) {
    ok += 1;
    if (previous.hidden) recovered.push({ id: link.id, label: link.label, url: link.url });
    health.links[link.id] = {
      url: link.url,
      label: link.label,
      pinned: Boolean(link.pinned),
      checkedAt: now,
      lastOkAt: now,
      httpStatus: result.httpStatus,
      checkMethod: result.method,
      finalUrl: result.finalUrl,
      ok: true,
      consecutiveFailures: 0,
      hidden: false,
      lastError: null,
    };
    continue;
  }

  broken += 1;
  const consecutiveFailures = (previous.consecutiveFailures ?? 0) + 1;
  const hidden = consecutiveFailures >= threshold;
  if (hidden && !previous.hidden) newlyHidden.push({ id: link.id, label: link.label, url: link.url, pinned: Boolean(link.pinned), error: result.error });
  health.links[link.id] = {
    url: link.url,
    label: link.label,
    pinned: Boolean(link.pinned),
    checkedAt: now,
    lastOkAt: previous.lastOkAt ?? null,
    httpStatus: null,
    ok: false,
    consecutiveFailures,
    hidden,
    lastError: result.error,
  };
}

// レジストリから外したリンクの結果は残さない。
const registeredIds = new Set(links.map((link) => link.id));
for (const id of Object.keys(health.links)) {
  if (!registeredIds.has(id)) delete health.links[id];
}

const hidden = Object.values(health.links).filter((record) => record.hidden).length;
health.schemaVersion = 1;
health.lastCompletedAt = now;
health.latestRun = { checked: results.length, ok, broken, hidden, failThreshold: threshold };
await fs.writeFile(healthPath, `${JSON.stringify(health, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ checked: results.length, ok, broken, hidden, failThreshold: threshold, newlyHidden, recovered }, null, 2));
if (newlyHidden.length > 0) process.exitCode = 3;
else if (broken > 0) process.exitCode = 2;
