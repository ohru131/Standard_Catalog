import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cataloguePath = path.join(root, "client", "src", "pages", "Home.tsx");
const monitorPath = path.join(root, "client", "src", "data", "catalogue-monitor.json");
const requestTimeoutMs = 25_000;
const isoRequestTimeoutMs = 120_000;
const isoMetadataUrl = "https://isopublicstorageprod.blob.core.windows.net/opendata/_latest/iso_deliverables_metadata/json/iso_deliverables_metadata.jsonl";
const monitorSourceOverrides = {
  "astm-e756": "https://store.astm.org/e0756-05r17.html",
};

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

function isIsoRecord(record) {
  return record.code.startsWith("ISO ");
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Fatigue-Index-Standards-Monitor/1.0 (+https://github.com/ohru131/Standard_Catalog)" },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function loadIsoMetadata(references) {
  if (!references.size) return { records: new Map(), source: isoMetadataUrl };
  const response = await fetchWithTimeout(isoMetadataUrl, isoRequestTimeoutMs);
  if (!response.ok) throw new Error(`ISO Open Data HTTP ${response.status}`);

  const text = await response.text();
  const allById = new Map();
  const matches = new Map();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      allById.set(entry.id, entry);
      if (references.has(entry.reference)) matches.set(entry.reference, entry);
    } catch {
      // ISO Open Data is JSONLines. Skip a malformed line rather than discard the full official dataset.
    }
  }

  return { records: matches, allById, source: response.url };
}

function isoCheckResult(record, isoData) {
  const entry = isoData.records.get(record.code);
  if (!entry) return { ok: false, error: "ISO Open Dataに一致する公式deliverable metadataがありません" };

  const publishedSuccessors = (entry.replacedBy ?? [])
    .map((id) => isoData.allById.get(id))
    .filter((candidate) => candidate?.currentStage === 6060)
    .map((candidate) => candidate.reference);
  const raw = JSON.stringify({
    reference: entry.reference,
    title: entry.title?.en ?? "",
    edition: entry.edition,
    publicationDate: entry.publicationDate,
    currentStage: entry.currentStage,
    replacedBy: entry.replacedBy ?? [],
  });
  const reviewReason = publishedSuccessors.length
    ? `ISO Open Dataで公開済み後継規格を検出: ${publishedSuccessors.join(", ")}`
    : null;

  return {
    ok: true,
    httpStatus: 200,
    finalUrl: record.source,
    title: entry.title?.en ? `${entry.reference} — ${entry.title.en}` : entry.reference,
    fingerprint: createHash("sha256").update(raw).digest("hex"),
    checkMethod: "ISO Open Data",
    monitorSource: isoData.source,
    officialMetadata: {
      reference: entry.reference,
      edition: entry.edition ?? null,
      publicationDate: entry.publicationDate ?? null,
      currentStage: entry.currentStage ?? null,
      replacedBy: entry.replacedBy ?? [],
    },
    reviewReason,
  };
}

async function checkDirectRecord(record) {
  const monitorSource = monitorSourceOverrides[record.id] ?? record.source;
  try {
    const response = await fetchWithTimeout(monitorSource, requestTimeoutMs);
    const html = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed = pageSummary(html);
    if (!parsed.summary) throw new Error("規格ページの基本メタデータを取得できませんでした");
    return { ok: true, httpStatus: response.status, finalUrl: response.url, monitorSource, checkMethod: "公式個別ページ", ...parsed };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error), monitorSource };
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

const isoRecords = standards.filter(isIsoRecord);
let isoData;
try {
  isoData = await loadIsoMetadata(new Set(isoRecords.map((record) => record.code)));
} catch (error) {
  isoData = { error: error instanceof Error ? error.message : String(error), records: new Map(), allById: new Map(), source: isoMetadataUrl };
}

const directRecords = standards.filter((record) => !isIsoRecord(record));
const requestedConcurrency = Number.parseInt(process.env.STANDARDS_CHECK_CONCURRENCY ?? "4", 10);
const concurrency = Number.isFinite(requestedConcurrency) && requestedConcurrency > 0 ? Math.min(requestedConcurrency, 4) : 4;
const results = isoRecords.map((record) => ({ record, result: isoData.error ? { ok: false, error: isoData.error, monitorSource: isoData.source } : isoCheckResult(record, isoData) }));
for (let offset = 0; offset < directRecords.length; offset += concurrency) {
  const batch = directRecords.slice(offset, offset + concurrency);
  results.push(...await Promise.all(batch.map(async (record) => ({ record, result: await checkDirectRecord(record) }))));
}

let checked = 0;
let failed = 0;
const changes = [];
for (const { record, result } of results) {
  const previous = monitor.records[record.id] ?? {};
  if (!result.ok) {
    failed += 1;
    monitor.records[record.id] = {
      ...previous,
      code: record.code,
      source: record.source,
      monitorSource: result.monitorSource ?? record.source,
      lastError: result.error,
      lastAttemptAt: now,
    };
    continue;
  }

  checked += 1;
  const changed = Boolean(previous.fingerprint && previous.fingerprint !== result.fingerprint);
  const newlyFlagged = Boolean(result.reviewReason && !previous.pendingReview);
  const pendingReview = Boolean(previous.pendingReview || changed || result.reviewReason);
  monitor.records[record.id] = {
    ...previous,
    code: record.code,
    source: record.source,
    monitorSource: result.monitorSource ?? record.source,
    checkMethod: result.checkMethod ?? "公式個別ページ",
    checkedAt: now,
    httpStatus: result.httpStatus,
    finalUrl: result.finalUrl,
    pageTitle: result.title,
    fingerprint: result.fingerprint,
    officialMetadata: result.officialMetadata ?? previous.officialMetadata ?? null,
    reviewReason: result.reviewReason ?? null,
    pendingReview,
    lastError: null,
    lastAttemptAt: now,
  };
  if (changed || newlyFlagged) {
    changes.push({
      id: record.id,
      code: record.code,
      source: record.source,
      detectedAt: now,
      previousTitle: previous.pageTitle ?? "",
      currentTitle: result.title,
      reason: result.reviewReason ?? "公式確認メタデータの変更を検出",
    });
  }
}

monitor.schemaVersion = 2;
monitor.lastCompletedAt = now;
monitor.latestRun = { checked, failed, changed: changes.length };
monitor.recentChanges = [...changes, ...monitor.recentChanges].slice(0, 80);
await fs.writeFile(monitorPath, `${JSON.stringify(monitor, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ monitored: standards.length, checked, failed, changed: changes.length, changes }, null, 2));
if (failed > 0) process.exitCode = 2;
