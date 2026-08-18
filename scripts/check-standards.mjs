import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cataloguePath = path.join(root, "client", "src", "pages", "Home.tsx");
const monitorPath = path.join(root, "client", "src", "data", "catalogue-monitor.json");
const requestTimeoutMs = 25_000;

function cleanText(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function findAttribute(html, attribute) {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${attribute}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  return html.match(pattern)?.[1] ?? "";
}

function pageSummary(html) {
  const title = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const description = cleanText(findAttribute(html, "description") || findAttribute(html, "og:description"));
  const heading = cleanText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] ?? "";
  const raw = `${title}\n${description}\n${heading}\n${canonical}`.trim();
  return { title: title.slice(0, 300), summary: raw.slice(0, 1_600), fingerprint: createHash("sha256").update(raw).digest("hex") };
}

function standardsFromSource(source) {
  const start = source.indexOf("const standards: Standard[]");
  const end = source.indexOf("const categories", start);
  const section = source.slice(start, end);
  const records = [];
  const pattern = /id:\s*"([^"]+)"[\s\S]*?code:\s*"([^"]+)"[\s\S]*?source:\s*"([^"]+)"/g;
  for (const match of section.matchAll(pattern)) records.push({ id: match[1], code: match[2], source: match[3] });
  return records;
}

async function checkRecord(record) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(record.source, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Fatigue-Index-Standards-Monitor/1.0 (+https://github.com/ohru131/Standard_Catalog)" },
    });
    const html = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed = pageSummary(html);
    if (!parsed.summary) throw new Error("規格ページの基本メタデータを取得できませんでした");
    return { ok: true, httpStatus: response.status, finalUrl: response.url, ...parsed };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

const now = new Date().toISOString();
const [catalogueSource, monitorSource] = await Promise.all([fs.readFile(cataloguePath, "utf8"), fs.readFile(monitorPath, "utf8")]);
const allStandards = standardsFromSource(catalogueSource);
if (allStandards.length < 1) throw new Error("Home.tsxから監視対象規格を抽出できませんでした。");
const requestedLimit = Number.parseInt(process.env.STANDARDS_CHECK_LIMIT ?? "", 10);
const standards = Number.isFinite(requestedLimit) && requestedLimit > 0 ? allStandards.slice(0, requestedLimit) : allStandards;
const monitor = JSON.parse(monitorSource);
monitor.records ??= {};
monitor.recentChanges ??= [];

let checked = 0;
let failed = 0;
const changes = [];
const requestedConcurrency = Number.parseInt(process.env.STANDARDS_CHECK_CONCURRENCY ?? "4", 10);
const concurrency = Number.isFinite(requestedConcurrency) && requestedConcurrency > 0 ? Math.min(requestedConcurrency, 4) : 4;
const results = [];
for (let offset = 0; offset < standards.length; offset += concurrency) {
  const batch = standards.slice(offset, offset + concurrency);
  results.push(...await Promise.all(batch.map(async (record) => ({ record, result: await checkRecord(record) }))));
}

for (const { record, result } of results) {
  const previous = monitor.records[record.id] ?? {};
  if (!result.ok) {
    failed += 1;
    monitor.records[record.id] = { ...previous, code: record.code, source: record.source, lastError: result.error, lastAttemptAt: now };
    continue;
  }
  checked += 1;
  const changed = Boolean(previous.fingerprint && previous.fingerprint !== result.fingerprint);
  const pendingReview = Boolean(previous.pendingReview || changed);
  monitor.records[record.id] = {
    ...previous,
    code: record.code,
    source: record.source,
    checkedAt: now,
    httpStatus: result.httpStatus,
    finalUrl: result.finalUrl,
    pageTitle: result.title,
    fingerprint: result.fingerprint,
    pendingReview,
    lastError: null,
    lastAttemptAt: now,
  };
  if (changed) changes.push({ id: record.id, code: record.code, source: record.source, detectedAt: now, previousTitle: previous.pageTitle ?? "", currentTitle: result.title });
}

monitor.schemaVersion = 1;
monitor.lastCompletedAt = now;
monitor.latestRun = { checked, failed, changed: changes.length };
monitor.recentChanges = [...changes, ...monitor.recentChanges].slice(0, 80);
await fs.writeFile(monitorPath, `${JSON.stringify(monitor, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ monitored: standards.length, checked, failed, changed: changes.length, changes }, null, 2));
if (failed > 0) process.exitCode = 2;
