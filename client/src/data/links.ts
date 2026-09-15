/**
 * Style context: URLは目録の一次情報への導線であり、装飾ではありません。全URLを links.json で一括管理し、
 * 月次のリンク死活監視結果（link-health.json）に従って、到達できなくなった補助リンクを表示から自動的に外します。
 */
import linkRegistry from "@/data/links.json";
import linkHealthData from "@/data/link-health.json";

export type LinkLang = "ja" | "en";
export type LinkKind = "official" | "catalog" | "reference";

export type RegisteredLink = {
  id: string;
  url: string;
  label: string;
  lang: LinkLang;
  kind: LinkKind;
  note: string;
  /** 一次情報のため、リンク切れを検出しても自動非表示にせず注記だけを添えるリンク。 */
  pinned: boolean;
};

export type LinkHealthRecord = {
  url: string;
  label?: string;
  pinned?: boolean;
  checkedAt?: string;
  lastOkAt?: string | null;
  httpStatus?: number | null;
  checkMethod?: string;
  finalUrl?: string;
  ok?: boolean;
  /** 401/403/429。サーバーは応答しているが自動確認を拒否した状態で、リンク切れではありません。 */
  restricted?: boolean;
  consecutiveFailures?: number;
  hidden?: boolean;
  lastError?: string | null;
};

export type LinkHealth = {
  schemaVersion: number;
  lastCompletedAt: string | null;
  latestRun: { checked: number; ok: number; broken: number; hidden: number; restricted?: number; failThreshold?: number } | null;
  links: Record<string, LinkHealthRecord>;
};

type LinkRegistry = {
  schemaVersion: number;
  policy: { hideAfterConsecutiveFailures: number; note: string };
  authorityLinks: Record<string, string[]>;
  categoryLinks: Record<string, string[]>;
  standardLinks: Record<string, { official: string; related: string[] }>;
  links: RegisteredLink[];
};

const registry = linkRegistry as LinkRegistry;
const linkHealth = linkHealthData as LinkHealth;
const linksById = new Map(registry.links.map((link) => [link.id, link]));

/** 表示可能なリンク。needsReview は「一次情報だが直近の確認に失敗した」状態を示します。 */
export type ResolvedLink = RegisteredLink & { needsReview: boolean; lastCheckedAt?: string };

export const linkPolicy = registry.policy;
export const linkHealthSummary = { lastCompletedAt: linkHealth.lastCompletedAt, latestRun: linkHealth.latestRun };

/** リンクIDを1件解決します。非表示の補助リンクには null を返します。 */
function resolve(id: string): ResolvedLink | null {
  const link = linksById.get(id);
  if (!link) return null;
  const stored = linkHealth.links[id];
  // レジストリでURLを差し替えた場合、古いURLに対する監視結果は引き継ぎません。
  const health = stored?.url === link.url ? stored : undefined;
  // 監視で継続的に到達できなくなった補助リンクは、目録の導線から自動的に外します。
  if (health?.hidden && !link.pinned) return null;
  return { ...link, needsReview: Boolean(health?.hidden), lastCheckedAt: health?.checkedAt };
}

/** 同一URLのリンクを1件に畳み込みます（規格別・体系別・領域別の割り当てが重なるため）。 */
function dedupe(links: ResolvedLink[]) {
  return Array.from(new Map(links.map((link) => [link.url, link])).values());
}

/** リンクIDの配列を、表示可能なリンクへ解決します（非表示になった補助リンクは除外）。 */
export function resolveLinks(ids: string[]): ResolvedLink[] {
  return dedupe(ids.map(resolve).filter((link): link is ResolvedLink => link !== null));
}

/** 一次情報として参照する公式規格ページ。リンク切れ時も導線を残すため常に返します。 */
export function getOfficialLink(standardId: string): ResolvedLink | null {
  const entry = registry.standardLinks[standardId];
  if (!entry) return null;
  return resolve(entry.official);
}

/**
 * 規格1件に対する関連リンク。日本語の情報源を先に並べ、公式ページは別枠（getOfficialLink）で扱います。
 * 非表示になった補助リンクはここに現れません。
 */
export function getRelatedLinks(input: { id: string; authority: string; category: string }): ResolvedLink[] {
  const entry = registry.standardLinks[input.id];
  const ids = [...(entry?.related ?? []), ...(registry.authorityLinks[input.authority] ?? []), ...(registry.categoryLinks[input.category] ?? [])];
  const officialUrl = entry ? linksById.get(entry.official)?.url : undefined;
  const resolved = ids.map(resolve).filter((link): link is ResolvedLink => link !== null && link.url !== officialUrl);
  const langRank = (link: ResolvedLink) => (link.lang === "ja" ? 0 : 1);
  const kindRank = (link: ResolvedLink) => ["official", "catalog", "reference"].indexOf(link.kind);
  return dedupe(resolved).sort((a, b) => langRank(a) - langRank(b) || kindRank(a) - kindRank(b));
}

/** リンク確認日時を、目録の他の日付表示と同じ日本語書式に整えます。 */
export function formatLinkCheckDate(value?: string | null) {
  if (!value) return "未確認";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未確認";
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
