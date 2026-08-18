/**
 * Design reminder — 「試験片の余白」:
 * Swiss editorial structure, warm paper, graphite rules, and Fatigue Cobalt
 * prioritize searchable standards data over decorative UI.
 */
import { useMemo, useState } from "react";
import catalogueMonitorData from "@/data/catalogue-monitor.json";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  ExternalLink,
  FileSearch,
  Filter,
  FlaskConical,
  Menu,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

type Authority = "ASTM" | "ISO" | "JIS";

type Standard = {
  id: string;
  authority: Authority;
  code: string;
  edition: string;
  englishTitle: string;
  japaneseTitle: string;
  category: string;
  method: string;
  material: string;
  materials?: string[];
  relatedJis: string;
  relation: string;
  summary: string;
  notes: string[];
  source: string;
  sourceLabel: string;
  status?: "new" | "reference";
};

type CatalogueMonitor = {
  lastCompletedAt: string | null;
  latestRun: { checked: number; failed: number; changed: number } | null;
  records: Record<string, { checkedAt?: string; pendingReview?: boolean; lastError?: string | null }>;
};

const catalogueMonitor = catalogueMonitorData as CatalogueMonitor;

function formatCheckDate(value?: string | null) {
  if (!value) return "未確認";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未確認";
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

const officialScopeSummaries: Record<string, string> = {
  "astm-e466": "金属材料の平滑又は切欠き試験片を、室温・大気中で一定振幅の軸力により疲労試験する手順を扱います。主として弾性ひずみ域の疲労強度を求め、材料・形状・表面状態・応力条件の違いが耐疲労性へ与える影響を比較する用途に用います。",
  "astm-e606": "金属材料のひずみ制御疲労試験を対象とし、繰返し応力–ひずみ応答とひずみ–寿命特性を取得する手順を扱います。塑性ひずみを伴う低サイクル領域の評価に用います。",
  "astm-e647": "疲労き裂進展速度を、線形弾性破壊力学に基づく応力拡大係数範囲ΔKとの関係で求めます。近しきい値域からKmax支配の不安定化域までを対象とし、設計・材料選定・損傷許容評価に用いるデータを得ます。",
  "astm-e467": "軸疲労試験系における一定振幅の動的力について、制御値又は指示値の精度を検証する手順を扱います。静的な力検証を代替するものではなく、試験機構成・試験片・周波数・荷重範囲ごとの動的精度確認に用います。",
  "astm-e468": "金属材料の一定振幅疲労試験結果を、比較・解釈できる形式で提示するための手順を扱います。S–N又はε–Nデータの整理、表示及び報告の統一に用います。",
  "astm-e2207": "薄肉円管試験片を用い、ひずみ制御の軸荷重とねじりを組み合わせた疲労試験を扱います。複合負荷下の繰返し応答と疲労寿命を求める用途に用います。",
  "astm-e2948": "中実丸細線を対象に、回転曲げによる一定振幅疲労試験を行う手順を扱います。細線材料の繰返し曲げに対する寿命評価に用います。",
  "astm-e2368": "一軸試験片へ制御した温度履歴とひずみ履歴を同時に与える、ひずみ制御熱機械疲労試験を扱います。温度と機械ひずみの位相関係を含めた高温疲労評価に用います。",
  "iso-1099": "金属材料の試験片について、一定振幅の軸力制御疲労試験を実施する方法を定めます。軸方向の繰返し荷重に対する疲労特性の取得を対象とします。",
  "iso-12106": "一軸変形試験片を対象に、軸ひずみ制御による金属材料の疲労試験方法を定めます。全ひずみ範囲を管理し、低サイクル疲労の応答と寿命を評価します。",
  "iso-1143": "金属材料の回転棒曲げ疲労試験方法を定めます。空気中で室温又は高温における回転曲げ負荷への疲労特性評価を対象とします。",
  "iso-12111": "一軸金属試験片を対象に、ひずみ制御で温度履歴と機械ひずみを組み合わせる熱機械疲労試験方法を定めます。高温下の温度–ひずみ連成疲労評価に用います。",
  "jis-z2289": "意図的な応力集中部を設けない金属試験片について、軸方向・一定振幅の軸力制御疲労試験を行う方法を定めます。室温又は高温での金属材料の疲労特性評価を対象とします。",
  "jis-z2274": "金属材料を空気中で回転させながら曲げ負荷を与える、回転曲げ疲労試験方法を定めます。室温又は高温における回転曲げ疲労特性の取得を対象とします。",
  "jis-z2279": "金属材料について、高温・一定ひずみ範囲制御の一軸引張–圧縮繰返し負荷により低サイクル疲労寿命を求める方法を定めます。",
  "astm-e1876": "棒状又は板状試験片の共振周波数を衝撃加振で測定し、動的ヤング率、せん断弾性率及びポアソン比を求める方法を扱います。弾性材料の非破壊的な動的弾性率評価に用います。",
  "astm-e756": "片持ち梁構成で振動減衰を測定し、材料又は制振層の損失係数と弾性率を求める方法を扱います。材料の振動減衰性能を比較する用途に用います。",
  "astm-d4065": "プラスチックの動的機械特性を、温度、周波数又は時間に対する複素弾性率の変化として測定する方法を扱います。貯蔵弾性率、損失弾性率及び損失正接の評価に用います。",
  "iso-6721-1": "硬質プラスチックの線形粘弾性領域における動的機械特性の測定について、共通の原理、用語及び試験上の留意点を定めます。",
  "iso-6721-2": "ねじり振子法により、プラスチックの動的機械特性を温度の関数として求める方法を定めます。ねじり貯蔵弾性率、損失成分及び損失正接の評価を対象とします。",
  "jis-k7244-1": "硬質プラスチックの線形粘弾性領域における動的機械特性試験について、共通の原理と取扱いを定めます。JIS K 7244系列の各試験法に共通する基準です。",
  "jis-k7244-2": "ねじり振子法を用いて、プラスチックのねじり方向の動的機械特性を求める試験方法を定めます。温度に対する貯蔵成分・損失成分の評価を対象とします。",
  "jis-k7244-4": "引張・非共振強制振動法により、プラスチックの引張複素弾性率の成分を測定する方法を定めます。主に低周波数域の動的粘弾性評価に用います。",
  "iso-12108": "金属材料の疲労き裂進展速度を、応力拡大係数範囲ΔKとの関係で求める方法を定めます。予き裂試験片を用いた安定き裂進展の評価を対象とします。",
  "iso-12110-1": "金属材料の変動振幅疲労試験について、一般原則、試験方法及び報告要件を定めます。主として単一アクチュエータによる力制御の負荷時系列試験を対象とします。",
  "iso-12110-2": "変動振幅疲労試験で用いるサイクル計数及び関連するデータ削減方法を定めます。負荷時系列から疲労解析に必要な整理データを得る用途に用います。",
  "iso-22407": "軸試験機と平面曲げ治具を用い、金属材料へ一定振幅の力又は変位を与える平面曲げ疲労試験方法を定めます。曲げ疲労寿命の評価を対象とします。",
  "iso-23296": "金属材料の力制御熱機械疲労試験について、装置、試験片、手順及び結果提示を定めます。温度と機械的負荷を連成させる高温疲労評価を対象とします。",
  "astm-d7791": "剛性又は半剛性プラスチックについて、引張又は圧縮の一軸繰返し負荷に対する疲労特性を求める方法を扱います。応力又はひずみ振幅に対する寿命比較に用います。",
  "astm-d4482": "未切欠きゴム試験片に伸長・除荷を繰り返し与え、破断までの伸長サイクル疲労寿命を求める方法を扱います。ゴム材料の繰返し伸長への耐久性比較に用います。",
  "astm-f2345": "セラミック製モジュラー大腿骨頭について、金属コーンとの組合せを含む繰返し荷重下の疲労強度を求める方法を扱います。専用治具と生理学的環境を要する医療用部品試験です。",
  "jis-k6270": "加硫ゴム又は熱可塑性ゴムについて、定ひずみの引張繰返し負荷で疲労特性を求める方法を定めます。伸長サイクルに対する耐久性評価を対象とします。",
  "jis-k6394": "加硫ゴム及び熱可塑性ゴムの動的性質を評価する際の一般指針を定めます。動的剛性、損失特性、発熱などの評価条件の整理に用います。",
  "jis-r1621": "ファインセラミックスを対象に、室温・大気中での四点曲げ繰返し負荷による曲げ疲労試験方法を定めます。曲げ疲労寿命の評価を対象とします。",
  "jis-t0309": "金属系生体材料について、繰返し荷重下の疲労特性を評価する試験方法を定めます。材料状態及び試験環境を管理した生体材料の疲労評価を対象とします。",
  "jis-t0310": "金属系生体材料について、切欠きの影響と疲労き裂進展特性を評価する試験方法を定めます。生体材料の損傷進展評価を対象とします。",
  "astm-e1820": "金属材料のMode I破壊靭性を、K、J、CTOD（δ）又はR曲線で求める方法を扱います。SE(B)、C(T)、DC(T)試験片に疲労予き裂を導入し、静止き裂・安定延性き裂開始・安定延性き裂進展への抵抗を評価します。",
  "astm-e399": "金属材料の平面ひずみ・線形弾性破壊靭性KICを求める方法を扱います。疲労予き裂試験片を用い、十分な板厚とリガメントを確保して、強い引張拘束下の破壊抵抗を評価します。",
  "astm-e1921": "遷移温度域でへき開破壊するフェライト鋼のKJcデータから、マスターカーブの基準温度T0を求めます。複数の疲労予き裂SE(B)、C(T)又はDC(T)試験片を用いる統計的な破壊靭性評価です。",
  "iso-12135": "均質な金属材料について、準静的荷重下のK、CTOD（δ）、J及びR曲線を求める統一試験方法です。疲労予き裂試験片をゆっくり変位増加させ、延性き裂開始・進展又は不安定破壊時の靭性を評価します。",
  "iso-15653": "金属材料の溶接部について、K、CTOD（δ）及びJによる準静的破壊靭性の点値を求めます。溶接金属又は熱影響部を狙って、溶接後に切欠き・疲労予き裂を導入した試験片を用います。",
  "astm-c1421": "先進セラミックスの室温KICを、予き裂梁、表面き裂曲げ又はシェブロンノッチ梁で求めます。大きな鋭いき裂又は自然欠陥相当の小さなき裂に対する破壊抵抗を評価します。",
  "astm-d5045": "プラスチックの平面ひずみ破壊靭性KICと臨界ひずみエネルギー解放率GICを、SENB又はCT試験片で求めます。十分な板厚と鋭いき裂を用い、き裂発生時の破壊抵抗を評価します。",
  "jis-r1607": "緻密質ファインセラミックスの室温破壊靭性を、予き裂導入、シェブロンノッチ又は圧子圧入等の規定方法で求めます。連続繊維強化材及び多孔体は適用対象外です。",
};

const standards: Standard[] = [
  {
    id: "astm-e466",
    authority: "ASTM",
    code: "ASTM E466-21",
    edition: "2021",
    englishTitle: "Force Controlled Constant Amplitude Axial Fatigue Tests of Metallic Materials",
    japaneseTitle: "金属材料の一定振幅・軸力制御疲労試験",
    category: "軸力制御",
    method: "力制御・一定振幅",
    material: "金属材料",
    relatedJis: "JIS Z 2289:2026",
    relation: "方法領域が近い。適用条件は原典で比較。",
    summary: "応力寿命（S–N）データの取得に用いられる、金属材料の軸方向・一定振幅疲労試験の実務的な入口です。",
    notes: ["一定振幅の軸方向負荷", "金属材料の疲労特性", "S–Nデータの取得"],
    source: "https://store.astm.org/e0466-21.html",
    sourceLabel: "ASTM E466-21 個別規格ページ",
  },
  {
    id: "astm-e606",
    authority: "ASTM",
    code: "ASTM E606/E606M-21",
    edition: "2021",
    englishTitle: "Strain-Controlled Fatigue Testing",
    japaneseTitle: "ひずみ制御疲労試験",
    category: "低サイクル",
    method: "ひずみ制御",
    material: "金属材料",
    relatedJis: "JIS Z 2279:1992",
    relation: "高温低サイクル疲労の関連JIS。完全一致ではない。",
    summary: "塑性ひずみを伴う繰返し負荷を対象に、ひずみ制御で疲労応答を評価するための代表的な試験方法です。",
    notes: ["ひずみ制御", "低サイクル領域", "応力–ひずみ応答"],
    source: "https://store.astm.org/e0606_e0606m-21.html",
    sourceLabel: "ASTM E606/E606M-21 個別規格ページ",
  },
  {
    id: "astm-e647",
    authority: "ASTM",
    code: "ASTM E647-24",
    edition: "2024",
    englishTitle: "Measurement of Fatigue Crack Growth Rates",
    japaneseTitle: "疲労き裂進展速度の測定",
    category: "き裂進展",
    method: "き裂進展測定",
    material: "金属材料",
    relatedJis: "—",
    relation: "JIS対応はこの一覧では未収載。",
    summary: "応力拡大係数範囲に対する疲労き裂進展速度を扱う、破壊力学ベースの評価規格です。",
    notes: ["疲労き裂進展", "破壊力学", "き裂成長速度"],
    source: "https://store.astm.org/e0647-24.html",
    sourceLabel: "ASTM E647-24 個別規格ページ",
  },
  {
    id: "astm-e467",
    authority: "ASTM",
    code: "ASTM E467-21",
    edition: "2021",
    englishTitle: "Verification of Constant Amplitude Dynamic Forces in an Axial Fatigue Testing System",
    japaneseTitle: "軸疲労試験系における一定振幅動的力の検証",
    category: "試験系検証",
    method: "動的力の検証",
    material: "試験システム",
    relatedJis: "JIS Z 2289:2026",
    relation: "軸力制御試験系の品質確認に関連。",
    summary: "試験結果の前提となる、軸疲労試験システムが与える動的力を検証するための実務規格です。",
    notes: ["試験システム", "動的力", "一定振幅の検証"],
    source: "https://store.astm.org/e0467-21.html",
    sourceLabel: "ASTM E467-21 個別規格ページ",
  },
  {
    id: "astm-e468",
    authority: "ASTM",
    code: "ASTM E468/E468M-23a",
    edition: "2023",
    englishTitle: "Presentation of Constant Amplitude Fatigue Test Results for Metallic Materials",
    japaneseTitle: "金属材料の一定振幅疲労試験結果の提示",
    category: "データ整理",
    method: "結果表示",
    material: "金属材料",
    relatedJis: "JIS Z 2289:2026",
    relation: "結果の提示・整理に関する関連規格。",
    summary: "一定振幅疲労試験の結果を比較可能な形で提示するための手引きとして参照されます。",
    notes: ["試験結果の提示", "一定振幅", "金属材料"],
    source: "https://store.astm.org/e0468_e0468m-23a.html",
    sourceLabel: "ASTM E468/E468M-23a 個別規格ページ",
  },
  {
    id: "astm-e2207",
    authority: "ASTM",
    code: "ASTM E2207-15(2021)",
    edition: "2021",
    englishTitle: "Strain-Controlled Axial-Torsional Fatigue Testing with Thin-Walled Tubular Specimens",
    japaneseTitle: "薄肉管試験片によるひずみ制御軸ねじり疲労試験",
    category: "複合負荷",
    method: "軸ねじり・ひずみ制御",
    material: "薄肉管・金属材料",
    relatedJis: "—",
    relation: "JIS対応はこの一覧では未収載。",
    summary: "軸方向とねじりを組み合わせた複合負荷下で、薄肉管試験片の疲労特性を扱います。",
    notes: ["軸ねじり", "複合負荷", "薄肉管試験片"],
    source: "https://store.astm.org/e2207-15r21.html",
    sourceLabel: "ASTM E2207-15(2021) 個別規格ページ",
  },
  {
    id: "astm-e2948",
    authority: "ASTM",
    code: "ASTM E2948-24",
    edition: "2024",
    englishTitle: "Rotating Bending Fatigue Tests of Solid Round Fine Wire",
    japaneseTitle: "中実丸細線の回転曲げ疲労試験",
    category: "回転曲げ",
    method: "回転曲げ",
    material: "金属材料（中実丸細線）",
    relatedJis: "JIS Z 2274:2024",
    relation: "回転曲げ試験領域の関連規格。",
    summary: "細線を対象とする回転曲げ疲労試験を扱い、線材の耐久評価で参照されます。",
    notes: ["回転曲げ", "細線", "繰返し曲げ"],
    source: "https://store.astm.org/e2948-24.html",
    sourceLabel: "ASTM E2948-24 個別規格ページ",
  },
  {
    id: "astm-e2368",
    authority: "ASTM",
    code: "ASTM E2368-25",
    edition: "2025",
    englishTitle: "Strain Controlled Thermomechanical Fatigue Testing",
    japaneseTitle: "ひずみ制御熱機械疲労試験",
    category: "熱機械疲労",
    method: "ひずみ・温度制御",
    material: "金属材料",
    relatedJis: "—",
    relation: "JIS対応はこの一覧では未収載。",
    summary: "温度履歴と機械的ひずみを連成させた熱機械疲労の評価方法です。",
    notes: ["熱機械疲労", "温度–ひずみ連成", "高温環境"],
    source: "https://store.astm.org/e2368-25.html",
    sourceLabel: "ASTM E2368-25 個別規格ページ",
  },
  {
    id: "iso-1099",
    authority: "ISO",
    code: "ISO 1099:2017",
    edition: "2017",
    englishTitle: "Metallic materials — Fatigue testing — Axial force-controlled method",
    japaneseTitle: "金属材料 — 疲労試験 — 軸力制御法",
    category: "軸力制御",
    method: "軸力制御・一定振幅",
    material: "金属材料",
    relatedJis: "JIS Z 2289:2026",
    relation: "同一テーマ。対応程度はJIS規格票で確認。",
    summary: "金属材料の軸方向・軸力制御疲労試験を対象とする国際規格です。",
    notes: ["軸力制御", "一定振幅", "金属材料"],
    source: "https://www.iso.org/standard/67847.html",
    sourceLabel: "ISO 1099:2017 個別規格ページ",
  },
  {
    id: "iso-12106",
    authority: "ISO",
    code: "ISO 12106:2017",
    edition: "2017",
    englishTitle: "Metallic materials — Fatigue testing — Axial-strain-controlled method",
    japaneseTitle: "金属材料 — 疲労試験 — 軸ひずみ制御法",
    category: "低サイクル",
    method: "軸ひずみ制御",
    material: "金属材料",
    relatedJis: "JIS Z 2279:1992",
    relation: "高温低サイクル領域の関連JIS。完全一致ではない。",
    summary: "一軸変形試験片のひずみ制御疲労試験を扱う、低サイクル疲労で参照される国際規格です。",
    notes: ["軸ひずみ制御", "低サイクル疲労", "一軸変形"],
    source: "https://www.iso.org/standard/64687.html",
    sourceLabel: "ISO 12106:2017 個別規格ページ",
  },
  {
    id: "iso-1143",
    authority: "ISO",
    code: "ISO 1143:2021",
    edition: "2021",
    englishTitle: "Metallic materials — Rotating bar bending fatigue testing",
    japaneseTitle: "金属材料 — 回転棒曲げ疲労試験",
    category: "回転曲げ",
    method: "回転棒曲げ",
    material: "金属材料",
    relatedJis: "JIS Z 2274:2024",
    relation: "整合作業の公開情報あり。対応程度は原典確認。",
    summary: "金属材料の回転棒曲げ疲労試験を対象とし、室温または高温での試験に用いられます。",
    notes: ["回転棒曲げ", "金属材料", "室温・高温"],
    source: "https://www.iso.org/standard/79575.html",
    sourceLabel: "ISO 1143:2021 個別規格ページ",
  },
  {
    id: "iso-12111",
    authority: "ISO",
    code: "ISO 12111:2011",
    edition: "2011",
    englishTitle: "Strain-controlled thermomechanical fatigue testing method",
    japaneseTitle: "ひずみ制御熱機械疲労試験方法",
    category: "熱機械疲労",
    method: "ひずみ・温度制御",
    material: "金属材料",
    relatedJis: "—",
    relation: "ASTM E2368と同一試験領域。",
    summary: "ひずみ制御下での一軸金属試験片を対象とする熱機械疲労試験の方法です。",
    notes: ["熱機械疲労", "ひずみ制御", "温度履歴"],
    source: "https://www.iso.org/standard/45583.html",
    sourceLabel: "ISO 12111:2011 個別規格ページ",
  },
  {
    id: "jis-z2289",
    authority: "JIS",
    code: "JIS Z 2289:2026",
    edition: "2026",
    englishTitle: "Axial force-controlled fatigue testing method of metallic materials",
    japaneseTitle: "金属材料の軸力制御疲労試験方法",
    category: "軸力制御",
    method: "軸力制御・一定振幅",
    material: "金属材料",
    relatedJis: "ISO 1099:2017",
    relation: "対応ISOの採用程度は規格票の対比表で確認。",
    summary: "意図的に応力集中部を導入しない金属試験片について、軸方向・一定振幅の軸力制御疲労試験条件を規定します。",
    notes: ["2026年版", "軸力制御", "室温・高温"],
    source: "https://webdesk.jsa.or.jp/books/W11M0090/?bunsyo_id=JIS%20Z%202289:2026",
    sourceLabel: "JSA Webdesk",
    status: "new",
  },
  {
    id: "jis-z2274",
    authority: "JIS",
    code: "JIS Z 2274:2024",
    edition: "2024",
    englishTitle: "Testing method of rotating bending fatigue of metallic materials",
    japaneseTitle: "金属材料の回転曲げ疲労試験方法",
    category: "回転曲げ",
    method: "回転曲げ",
    material: "金属材料",
    relatedJis: "ISO 1143:2021",
    relation: "ISO 1143への整合作業が公開されている。詳細は原典確認。",
    summary: "金属材料について、空気中で室温または高温における回転曲げ疲労試験方法を扱います。",
    notes: ["回転曲げ", "室温・高温", "金属材料"],
    source: "https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+Z+2274%3A2024",
    sourceLabel: "JIS Z 2274:2024 個別規格ページ",
  },
  {
    id: "jis-z2279",
    authority: "JIS",
    code: "JIS Z 2279:1992",
    edition: "1992",
    englishTitle: "High-temperature low-cycle fatigue testing method of metallic materials",
    japaneseTitle: "金属材料の高温低サイクル疲労試験方法",
    category: "低サイクル",
    method: "ひずみ範囲制御",
    material: "金属材料",
    relatedJis: "ISO 12106:2017",
    relation: "試験領域の関連。新版・対比表は原典確認。",
    summary: "高温における低サイクル疲労寿命を求める、一定ひずみ範囲制御下の一軸引張–圧縮疲労試験方法です。",
    notes: ["高温", "低サイクル疲労", "ひずみ範囲制御"],
    source: "https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+Z+2279%3A1992",
    sourceLabel: "JSA Webdesk",
    status: "reference",
  },
  {
    id: "astm-e1876",
    authority: "ASTM",
    code: "ASTM E1876-22",
    edition: "2022",
    englishTitle: "Dynamic Young's Modulus, Shear Modulus, and Poisson's Ratio by Impulse Excitation of Vibration",
    japaneseTitle: "衝撃加振法による動的ヤング率・剛性率・ポアソン比の測定",
    category: "動的弾性率",
    method: "衝撃加振・共振",
    material: "弾性材料（多材料）",
    materials: ["金属材料", "セラミックス・無機材料", "複合材料"],
    relatedJis: "—",
    relation: "JIS対応はこの一覧では未収載。",
    summary: "衝撃加振による共振を用いて、弾性材料の動的ヤング率、剛性率およびポアソン比を測定する試験方法です。",
    notes: ["衝撃加振", "共振周波数", "動的弾性率"],
    source: "https://store.astm.org/e1876-22.html",
    sourceLabel: "ASTM E1876-22 個別規格ページ",
  },
  {
    id: "astm-e756",
    authority: "ASTM",
    code: "ASTM E756-05(2017)",
    edition: "2017",
    englishTitle: "Measuring Vibration-Damping Properties of Materials",
    japaneseTitle: "材料の振動減衰特性の測定",
    category: "制振・減衰",
    method: "減衰片持ち梁",
    material: "制振材料（多材料）",
    materials: ["金属材料", "プラスチック・高分子", "セラミックス・無機材料", "複合材料"],
    relatedJis: "—",
    relation: "JIS対応はこの一覧では未収載。",
    summary: "損失係数とヤング率又はせん断弾性率を通じて、材料の振動減衰特性を評価する試験方法です。",
    notes: ["損失係数", "制振設計", "50–5000 Hz"],
    source: "https://www.astm.org/e0756-05r17.html",
    sourceLabel: "ASTM E756-05(2017) 個別規格ページ",
  },
  {
    id: "astm-d4065",
    authority: "ASTM",
    code: "ASTM D4065-20",
    edition: "2020",
    englishTitle: "Plastics: Dynamic Mechanical Properties",
    japaneseTitle: "プラスチックの動的機械特性",
    category: "動的粘弾性",
    method: "DMA・温度／周波数掃引",
    material: "プラスチック・高分子",
    materials: ["プラスチック・高分子"],
    relatedJis: "JIS K 7244-1:1998",
    relation: "ISO 6721・JIS K 7244系列と近接する動的粘弾性の試験領域。",
    summary: "温度、周波数又は時間に対する弾性率・損失弾性率の変化を通じて、プラスチックの動的機械特性を評価します。",
    notes: ["DMA", "貯蔵・損失弾性率", "プラスチック"],
    source: "https://store.astm.org/d4065-20.html",
    sourceLabel: "ASTM D4065-20 個別規格ページ",
  },
  {
    id: "iso-6721-1",
    authority: "ISO",
    code: "ISO 6721-1:2019",
    edition: "2019",
    englishTitle: "Plastics — Determination of dynamic mechanical properties — Part 1: General principles",
    japaneseTitle: "プラスチック — 動的機械特性の求め方 — 第1部：一般原則",
    category: "動的粘弾性",
    method: "一般原則",
    material: "プラスチック・高分子",
    materials: ["プラスチック・高分子"],
    relatedJis: "JIS K 7244-1:1998",
    relation: "JIS K 7244系列の共通事項に関連。採用程度は原典確認。",
    summary: "線形粘弾性領域における硬質プラスチックの動的機械特性を測定するための一般原則を定めます。",
    notes: ["線形粘弾性", "硬質プラスチック", "一般原則"],
    source: "https://www.iso.org/standard/73142.html",
    sourceLabel: "ISO 6721-1:2019 個別規格ページ",
  },
  {
    id: "iso-6721-2",
    authority: "ISO",
    code: "ISO 6721-2:2019",
    edition: "2019",
    englishTitle: "Plastics — Determination of dynamic mechanical properties — Part 2: Torsion-pendulum method",
    japaneseTitle: "プラスチック — 動的機械特性の求め方 — 第2部：ねじり振子法",
    category: "動的粘弾性",
    method: "ねじり振子法",
    material: "プラスチック・高分子",
    materials: ["プラスチック・高分子"],
    relatedJis: "JIS K 7244-2:1998",
    relation: "JIS K 7244-2と同一試験領域。対応程度は原典確認。",
    summary: "ねじり振子法によって、プラスチックのねじり弾性率の貯蔵成分・損失成分を温度の関数として測定します。",
    notes: ["ねじり振子", "貯蔵・損失成分", "温度依存"],
    source: "https://www.iso.org/standard/73143.html",
    sourceLabel: "ISO 6721-2:2019 個別規格ページ",
  },
  {
    id: "jis-k7244-1",
    authority: "JIS",
    code: "JIS K 7244-1:1998",
    edition: "1998",
    englishTitle: "Plastics — Methods of test for dynamic mechanical properties — Part 1: General principles",
    japaneseTitle: "プラスチック — 動的機械特性の試験方法 — 第1部：通則",
    category: "動的粘弾性",
    method: "一般原則",
    material: "プラスチック・高分子",
    materials: ["プラスチック・高分子"],
    relatedJis: "ISO 6721-1:2019",
    relation: "ISO 6721系列に関連。現行版・対比表は原典確認。",
    summary: "硬質プラスチックの線形粘弾性挙動の範囲で動的機械特性を試験する際の、用語と共通事項を扱います。",
    notes: ["JIS K 7244系列", "線形粘弾性", "通則"],
    source: "https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+K+7244-1%3A1998",
    sourceLabel: "JIS K 7244-1:1998 個別規格ページ",
    status: "reference",
  },
  {
    id: "jis-k7244-2",
    authority: "JIS",
    code: "JIS K 7244-2:1998",
    edition: "1998",
    englishTitle: "Plastics — Methods of test for dynamic mechanical properties — Part 2: Torsion-pendulum method",
    japaneseTitle: "プラスチック — 動的機械特性の試験方法 — 第2部：ねじり振子法",
    category: "動的粘弾性",
    method: "ねじり振子法",
    material: "プラスチック・高分子",
    materials: ["プラスチック・高分子"],
    relatedJis: "ISO 6721-2:2019",
    relation: "ISO 6721-2と同一試験領域。現行版・対比表は原典確認。",
    summary: "ねじり振子法を用いて、プラスチックの動的機械特性を測定するための試験方法です。",
    notes: ["ねじり振子", "動的粘弾性", "プラスチック"],
    source: "https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+K+7244-2%3A1998",
    sourceLabel: "JIS K 7244-2:1998 個別規格ページ",
    status: "reference",
  },
  {
    id: "jis-k7244-4",
    authority: "JIS",
    code: "JIS K 7244-4:1999",
    edition: "1999",
    englishTitle: "Plastics — Methods of test for dynamic mechanical properties — Part 4: Tensile vibration — Non-resonance method",
    japaneseTitle: "プラスチック — 動的機械特性の試験方法 — 第4部：引張振動・非共振法",
    category: "動的粘弾性",
    method: "引張・非共振強制振動",
    material: "プラスチック・高分子",
    materials: ["プラスチック・高分子"],
    relatedJis: "ISO 6721系列",
    relation: "ISO 6721系列に関連。対比と版の状況は原典確認。",
    summary: "主に0.01 Hz〜100 Hzの周波数範囲で、ポリマーの引張複素弾性率の成分を非共振強制振動法で測定します。",
    notes: ["引張振動", "非共振法", "0.01–100 Hz"],
    source: "https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+K+7244-4%3A1999",
    sourceLabel: "JIS K 7244-4:1999 個別規格ページ",
    status: "reference",
  },
  {
    id: "iso-12108",
    authority: "ISO",
    code: "ISO 12108:2018",
    edition: "2018",
    englishTitle: "Metallic materials — Fatigue testing — Fatigue crack growth method",
    japaneseTitle: "金属材料 — 疲労試験 — 疲労き裂進展方法",
    category: "き裂進展",
    method: "予き裂試験片・き裂進展測定",
    material: "金属材料",
    relatedJis: "—",
    relation: "ASTM E647と同一試験領域。対応関係は原典で確認。",
    summary: "金属材料の疲労き裂進展速度を、応力拡大係数範囲との関係で評価する国際規格です。",
    notes: ["疲労き裂進展", "予き裂", "da/dN–ΔK"],
    source: "https://www.iso.org/standard/73809.html",
    sourceLabel: "ISO 12108:2018 個別規格ページ",
  },
  {
    id: "iso-12110-1",
    authority: "ISO",
    code: "ISO 12110-1:2013",
    edition: "2013",
    englishTitle: "Metallic materials — Fatigue testing — Variable amplitude fatigue testing — Part 1: General principles, test method and reporting requirements",
    japaneseTitle: "金属材料 — 変動振幅疲労試験 — 第1部：一般原則、試験方法及び報告要件",
    category: "変動振幅",
    method: "任意波形・力制御",
    material: "金属材料",
    relatedJis: "—",
    relation: "単一アクチュエータの変動振幅試験を主対象とする。",
    summary: "実サービス荷重から得た負荷時系列を用い、主として力制御の変動振幅疲労試験を行うための一般原則です。",
    notes: ["変動振幅", "負荷時系列", "単一アクチュエータ"],
    source: "https://www.iso.org/standard/54712.html",
    sourceLabel: "ISO 12110-1:2013 個別規格ページ",
  },
  {
    id: "iso-12110-2",
    authority: "ISO",
    code: "ISO 12110-2:2013",
    edition: "2013",
    englishTitle: "Metallic materials — Fatigue testing — Variable amplitude fatigue testing — Part 2: Cycle counting and related data reduction methods",
    japaneseTitle: "金属材料 — 変動振幅疲労試験 — 第2部：サイクル計数及び関連データ削減方法",
    category: "変動振幅",
    method: "サイクル計数・データ削減",
    material: "金属材料",
    relatedJis: "ISO 12110-1:2013",
    relation: "ISO 12110-1の変動振幅試験結果を整理するための関連規格。",
    summary: "変動振幅疲労試験におけるサイクル計数と、関連するデータ削減方法を定めます。",
    notes: ["レインフロー計数", "データ削減", "変動振幅"],
    source: "https://www.iso.org/standard/54713.html",
    sourceLabel: "ISO 12110-2:2013 個別規格ページ",
  },
  {
    id: "iso-22407",
    authority: "ISO",
    code: "ISO 22407:2021",
    edition: "2021",
    englishTitle: "Metallic materials — Fatigue testing — Axial plane bending method",
    japaneseTitle: "金属材料 — 疲労試験 — 軸方向平面曲げ方法",
    category: "平面曲げ",
    method: "平面曲げ・力／変位制御",
    material: "金属材料",
    relatedJis: "—",
    relation: "軸試験機に平面曲げ治具を組み合わせる試験領域。",
    summary: "軸試験機で一定振幅の平面曲げ負荷を与え、金属材料の曲げ疲労寿命を評価する試験方法です。",
    notes: ["平面曲げ", "一定振幅", "軸試験機用治具"],
    source: "https://www.iso.org/standard/73126.html",
    sourceLabel: "ISO 22407:2021 個別規格ページ",
  },
  {
    id: "iso-23296",
    authority: "ISO",
    code: "ISO 23296:2025",
    edition: "2025",
    englishTitle: "Metallic materials — Fatigue testing — Force controlled thermo-mechanical fatigue testing method",
    japaneseTitle: "金属材料 — 疲労試験 — 力制御熱機械疲労試験方法",
    category: "熱機械疲労",
    method: "力制御・温度連成",
    material: "金属材料",
    relatedJis: "ASTM E2368-25",
    relation: "力制御TMFの最新ISO。高温構成・温度同期の確認が必要。",
    summary: "力制御の熱機械疲労試験について、装置、試験片、結果提示を扱う2025年版のISO規格です。",
    notes: ["2025年版", "力制御TMF", "高温・温度同期"],
    source: "https://www.iso.org/standard/85732.html",
    sourceLabel: "ISO 23296:2025 個別規格ページ",
    status: "new",
  },
  {
    id: "astm-d7791",
    authority: "ASTM",
    code: "ASTM D7791-22",
    edition: "2022",
    englishTitle: "Uniaxial Fatigue Properties of Plastics",
    japaneseTitle: "プラスチックの一軸疲労特性",
    category: "軸力制御",
    method: "引張／圧縮・一軸繰返し",
    material: "プラスチック・高分子",
    materials: ["プラスチック・高分子"],
    relatedJis: "—",
    relation: "プラスチックの一軸繰返し荷重を扱うASTM規格。",
    summary: "剛性又は半剛性プラスチックについて、引張又は圧縮の一軸繰返し負荷で動的疲労特性を求めます。",
    notes: ["プラスチック", "引張・圧縮", "一軸疲労"],
    source: "https://store.astm.org/d7791-22.html",
    sourceLabel: "ASTM D7791-22 個別規格ページ",
  },
  {
    id: "astm-d4482",
    authority: "ASTM",
    code: "ASTM D4482-11(2021)",
    edition: "2021",
    englishTitle: "Rubber Property—Extension Cycling Fatigue",
    japaneseTitle: "ゴム特性 — 伸長サイクル疲労",
    category: "軸力制御",
    method: "引張ひずみサイクル",
    material: "ゴム・熱可塑性ゴム",
    materials: ["ゴム・熱可塑性ゴム"],
    relatedJis: "JIS K 6270:2018",
    relation: "ゴムの伸長サイクル疲労としてJIS K 6270と同一試験領域。",
    summary: "未切欠きゴム試験片に引張ひずみサイクルを与え、破断までの疲労寿命を比較評価します。",
    notes: ["ゴム", "伸長サイクル", "疲労寿命"],
    source: "https://store.astm.org/d4482-11r21.html",
    sourceLabel: "ASTM D4482-11(2021) 個別規格ページ",
  },
  {
    id: "astm-f2345",
    authority: "ASTM",
    code: "ASTM F2345-21",
    edition: "2021",
    englishTitle: "Determination of Cyclic Fatigue Strength of Ceramic Modular Femoral Heads",
    japaneseTitle: "セラミック製モジュラー大腿骨頭の繰返し疲労強度の決定",
    category: "軸力制御",
    method: "医療用部品・繰返し圧縮",
    material: "セラミックス・無機材料",
    materials: ["セラミックス・無機材料"],
    relatedJis: "—",
    relation: "生理食塩水環境と専用のコーン治具を要する部品試験。",
    summary: "人工股関節用のセラミック製モジュラー大腿骨頭について、繰返し荷重下の疲労強度を比較評価します。",
    notes: ["医療用部品", "専用治具", "生理食塩水環境"],
    source: "https://store.astm.org/f2345-21.html",
    sourceLabel: "ASTM F2345-21 個別規格ページ",
  },
  {
    id: "jis-k6270",
    authority: "JIS",
    code: "JIS K 6270:2018",
    edition: "2018",
    englishTitle: "Rubber, vulcanized or thermoplastics — Determination of tension fatigue — Constant strain method",
    japaneseTitle: "加硫ゴム及び熱可塑性ゴム — 引張疲労特性の求め方（定ひずみ方法）",
    category: "軸力制御",
    method: "定ひずみ・引張疲労",
    material: "ゴム・熱可塑性ゴム",
    materials: ["ゴム・熱可塑性ゴム"],
    relatedJis: "ASTM D4482-11(2021)",
    relation: "ASTM D4482と近接するゴムの繰返し引張試験領域。",
    summary: "加硫ゴム及び熱可塑性ゴムの定ひずみ引張疲労特性を求めるための試験方法です。",
    notes: ["ゴム", "定ひずみ", "引張疲労"],
    source: "https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+K+6270%3A2018",
    sourceLabel: "JIS K 6270:2018 個別規格ページ",
  },
  {
    id: "jis-k6394",
    authority: "JIS",
    code: "JIS K 6394:2007",
    edition: "2007",
    englishTitle: "Rubber, vulcanized or thermoplastic — Determination of dynamic properties — General guidance",
    japaneseTitle: "加硫ゴム及び熱可塑性ゴム — 動的性質の求め方 — 一般指針",
    category: "動的粘弾性",
    method: "動的剛性・損失特性",
    material: "ゴム・熱可塑性ゴム",
    materials: ["ゴム・熱可塑性ゴム"],
    relatedJis: "—",
    relation: "ゴムの動的性質評価に関する一般指針。実施には適切な動的治具が必要。",
    summary: "ゴム及び熱可塑性ゴムの温度上昇、動的クリープ、圧縮永久ひずみなどを含む動的性質評価の一般指針です。",
    notes: ["ゴム", "動的剛性", "専用治具"],
    source: "https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+K+6394%3A2007",
    sourceLabel: "JIS K 6394:2007 個別規格ページ",
    status: "reference",
  },
  {
    id: "jis-r1621",
    authority: "JIS",
    code: "JIS R 1621:2008",
    edition: "2008",
    englishTitle: "Testing method for bending fatigue of fine ceramics at room temperature",
    japaneseTitle: "ファインセラミックスの室温曲げ疲労試験方法",
    category: "平面曲げ",
    method: "四点曲げ・繰返し負荷",
    material: "セラミックス・無機材料",
    materials: ["セラミックス・無機材料"],
    relatedJis: "ISO 22407:2021",
    relation: "平面曲げ疲労の関連規格。セラミックス用の四点曲げ治具が必要。",
    summary: "室温・大気中で、ファインセラミックスの曲げ疲労を四点曲げ構成で評価する試験方法です。",
    notes: ["ファインセラミックス", "四点曲げ", "室温"],
    source: "https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+R+1621%3A2008",
    sourceLabel: "JIS R 1621:2008 個別規格ページ",
    status: "reference",
  },
  {
    id: "jis-t0309",
    authority: "JIS",
    code: "JIS T 0309:2009",
    edition: "2009",
    englishTitle: "Test method for fatigue properties of metallic biomaterials",
    japaneseTitle: "金属系生体材料の疲労試験方法",
    category: "軸力制御",
    method: "生体材料・繰返し荷重",
    material: "金属系生体材料",
    materials: ["金属材料"],
    relatedJis: "—",
    relation: "生体材料に特有の環境・材料状態を管理する材料疲労試験規格。",
    summary: "金属系生体材料の疲労特性を、繰返し荷重条件下で評価するための試験方法です。",
    notes: ["生体材料", "繰返し荷重", "試験環境"],
    source: "https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+T+0309%3A2009",
    sourceLabel: "JIS T 0309:2009 個別規格ページ",
    status: "reference",
  },
  {
    id: "jis-t0310",
    authority: "JIS",
    code: "JIS T 0310:2009",
    edition: "2009",
    englishTitle: "Test method for notch sensitivity and fatigue crack growth properties of metallic biomaterials",
    japaneseTitle: "金属系生体材料の切欠き効果及び疲労き裂進展特性の試験方法",
    category: "き裂進展",
    method: "切欠き・き裂進展測定",
    material: "金属系生体材料",
    materials: ["金属材料"],
    relatedJis: "ISO 12108:2018",
    relation: "ISO 12108と近接するき裂進展評価領域。生体材料用の試験環境を別途確認。",
    summary: "金属系生体材料について、切欠き感受性と疲労き裂進展特性を評価するための試験方法です。",
    notes: ["生体材料", "切欠き", "疲労き裂進展"],
    source: "https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+T+0310%3A2009",
    sourceLabel: "JIS T 0310:2009 個別規格ページ",
    status: "reference",
  },
  {
    id: "astm-e1820",
    authority: "ASTM",
    code: "ASTM E1820-25",
    edition: "2025",
    englishTitle: "Measurement of Fracture Toughness",
    japaneseTitle: "破壊靭性の測定（K・J・CTOD・R曲線）",
    category: "破壊靭性",
    method: "CT／SE(B)・疲労予き裂・COD計測",
    material: "金属材料",
    materials: ["金属材料"],
    relatedJis: "ISO 12135:2021",
    relation: "K、J、CTOD及びR曲線を扱う金属材料の統一的な関連規格。試験片形状と有効性判定は原典で比較。",
    summary: "金属材料のK、J、CTOD及びR曲線を、疲労予き裂CT又は曲げ試験片で求める代表的な破壊靭性規格です。",
    notes: ["K・J・CTOD", "CT／SE(B)試験片", "疲労予き裂"],
    source: "https://store.astm.org/e1820-25.html",
    sourceLabel: "ASTM E1820-25 個別規格ページ",
    status: "new",
  },
  {
    id: "astm-e399",
    authority: "ASTM",
    code: "ASTM E399-24",
    edition: "2024",
    englishTitle: "Linear-Elastic Plane-Strain Fracture Toughness of Metallic Materials",
    japaneseTitle: "金属材料の線形弾性・平面ひずみ破壊靭性 KIC",
    category: "破壊靭性",
    method: "KIC・CT／SE(B)・疲労予き裂",
    material: "金属材料",
    materials: ["金属材料"],
    relatedJis: "ISO 12135:2021",
    relation: "KICを扱う関連規格。JIS G 0564:1999は廃止のため現行対応規格としては掲載しない。",
    summary: "疲労予き裂試験片を用い、平面ひずみかつ線形弾性条件で金属材料のKICを求めます。",
    notes: ["KIC", "平面ひずみ", "有効性判定"],
    source: "https://store.astm.org/e0399-24.html",
    sourceLabel: "ASTM E399-24 個別規格ページ",
  },
  {
    id: "astm-e1921",
    authority: "ASTM",
    code: "ASTM E1921-25A",
    edition: "2025",
    englishTitle: "Determination of Reference Temperature, T0, for Ferritic Steels in the Transition Range",
    japaneseTitle: "フェライト鋼遷移温度域の基準温度 T0 の決定",
    category: "破壊靭性",
    method: "KJc・マスターカーブ・低温構成",
    material: "金属材料",
    materials: ["金属材料"],
    relatedJis: "ISO 12135:2021",
    relation: "フェライト鋼のへき開破壊・遷移温度域に対する統計的補完規格。ISO 12135の適用上の留意事項と関連。",
    summary: "フェライト鋼のKJcデータを統計処理し、遷移温度域のマスターカーブ基準温度T0を求めます。",
    notes: ["KJc", "T0", "温度環境・複数試験片"],
    source: "https://store.astm.org/e1921-25a.html",
    sourceLabel: "ASTM E1921-25A 個別規格ページ",
    status: "new",
  },
  {
    id: "iso-12135",
    authority: "ISO",
    code: "ISO 12135:2021",
    edition: "2021",
    englishTitle: "Metallic materials — Unified method of test for the determination of quasistatic fracture toughness",
    japaneseTitle: "金属材料 — 準静的破壊靭性の統一試験方法",
    category: "破壊靭性",
    method: "K・CTOD・J・R曲線／準静的",
    material: "金属材料",
    materials: ["金属材料"],
    relatedJis: "ASTM E1820-25",
    relation: "K、CTOD、J及びR曲線を対象とするASTM E1820の関連規格。溶接部はISO 15653を併用。",
    summary: "均質な金属材料について、準静的なK、CTOD、J及びR曲線を求める統一試験方法です。",
    notes: ["K・CTOD・J・R曲線", "準静的", "疲労予き裂"],
    source: "https://www.iso.org/standard/78208.html",
    sourceLabel: "ISO 12135:2021 個別規格ページ",
  },
  {
    id: "iso-15653",
    authority: "ISO",
    code: "ISO 15653:2018",
    edition: "2018",
    englishTitle: "Metallic materials — Method of test for the determination of quasistatic fracture toughness of welds",
    japaneseTitle: "金属材料 — 溶接部の準静的破壊靭性試験方法",
    category: "破壊靭性",
    method: "溶接部CTOD・J・K／疲労予き裂",
    material: "金属材料（溶接継手）",
    materials: ["金属材料"],
    relatedJis: "ISO 12135:2021",
    relation: "母材の共通事項はISO 12135を併用。溶接金属又は熱影響部を狙う試験片の位置決めが重要。",
    summary: "溶接金属又は熱影響部を対象に、K、CTOD及びJによる準静的破壊靭性の点値を求めます。",
    notes: ["溶接金属・HAZ", "CTOD・J・K", "疲労予き裂"],
    source: "https://www.iso.org/standard/70865.html",
    sourceLabel: "ISO 15653:2018 個別規格ページ",
  },
  {
    id: "astm-c1421",
    authority: "ASTM",
    code: "ASTM C1421-18(2025)",
    edition: "2025",
    englishTitle: "Determination of Fracture Toughness of Advanced Ceramics at Ambient Temperature",
    japaneseTitle: "先進セラミックスの室温破壊靭性 KIC の測定",
    category: "破壊靭性",
    method: "予き裂梁・シェブロンノッチ・曲げ",
    material: "セラミックス・無機材料",
    materials: ["セラミックス・無機材料"],
    relatedJis: "JIS R 1607:2015",
    relation: "室温セラミックス破壊靭性の関連JIS。予き裂又はシェブロンノッチの方法・試験片条件は原典で比較。",
    summary: "先進セラミックスのKICを、予き裂梁、表面き裂曲げ又はシェブロンノッチ梁で求めます。",
    notes: ["セラミックスKIC", "曲げ治具", "予き裂・ノッチ"],
    source: "https://store.astm.org/c1421-18r25.html",
    sourceLabel: "ASTM C1421-18(2025) 個別規格ページ",
    status: "new",
  },
  {
    id: "astm-d5045",
    authority: "ASTM",
    code: "ASTM D5045-14(2022)",
    edition: "2022",
    englishTitle: "Plane-Strain Fracture Toughness and Strain Energy Release Rate of Plastic Materials",
    japaneseTitle: "プラスチックの平面ひずみ破壊靭性 KIC・GIC",
    category: "破壊靭性",
    method: "SENB／CT・KIC・GIC",
    material: "プラスチック・高分子",
    materials: ["プラスチック・高分子"],
    relatedJis: "—",
    relation: "ISO 13586と同一主題だが技術内容は異なる。JIS対応はこの一覧では未収載。",
    summary: "プラスチックのKICとGICを、単一端切欠き曲げ又はCT試験片で求めます。",
    notes: ["プラスチックKIC・GIC", "SENB・CT", "平面ひずみ"],
    source: "https://store.astm.org/d5045-14r22.html",
    sourceLabel: "ASTM D5045-14(2022) 個別規格ページ",
  },
  {
    id: "jis-r1607",
    authority: "JIS",
    code: "JIS R 1607:2015",
    edition: "2015",
    englishTitle: "Testing methods for fracture toughness of fine ceramics at room temperature",
    japaneseTitle: "ファインセラミックスの室温破壊靭性試験方法",
    category: "破壊靭性",
    method: "予き裂・シェブロンノッチ・曲げ",
    material: "セラミックス・無機材料",
    materials: ["セラミックス・無機材料"],
    relatedJis: "ASTM C1421-18(2025)",
    relation: "室温セラミックスKICの関連ASTM。連続繊維強化材及び多孔体は適用対象外。",
    summary: "緻密質ファインセラミックスの室温破壊靭性を、規定した予き裂又はノッチ方法で測定します。",
    notes: ["ファインセラミックス", "室温KIC", "曲げ試験"],
    source: "https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+R+1607%3A2015",
    sourceLabel: "JIS R 1607:2015 個別規格ページ",
  },
];

const categories = ["すべて", "軸力制御", "低サイクル", "回転曲げ", "平面曲げ", "変動振幅", "熱機械疲労", "き裂進展", "破壊靭性", "複合負荷", "動的粘弾性", "動的弾性率", "制振・減衰", "試験系検証", "データ整理"];
const materialFilters = ["すべて", "金属材料", "プラスチック・高分子", "ゴム・熱可塑性ゴム", "セラミックス・無機材料", "複合材料", "試験システム"];

const authorityStyles: Record<Authority, string> = {
  ASTM: "bg-[#edf3fb] text-[#1d4e89] border-[#bfd3eb]",
  ISO: "bg-[#eef3ed] text-[#365b38] border-[#c7d9c3]",
  JIS: "bg-[#f8ede8] text-[#a43f21] border-[#edcabc]",
};

type TestGuide = {
  aim: string;
  setup: string[];
  outcomes: string[];
  report: string[];
  caution: string;
};

const testGuides: Record<string, TestGuide> = {
  "軸力制御": {
    aim: "一定振幅の軸方向荷重に対する疲労強度・寿命を、主として弾性域で整理します。",
    setup: ["試料ロット、熱処理、採取方向、試験片寸法・表面状態を記録", "最大・最小荷重又は応力、応力比R、波形、周波数を設定", "温度・雰囲気、打切りサイクル、破断判定を事前に定義"],
    outcomes: ["S–N（応力–寿命）データ", "破断サイクル又は打切り寿命", "破面・破断位置の観察記録"],
    report: ["規格番号・版、試験片図面、材料状態", "荷重／応力範囲、R、波形、周波数、環境", "各試験片の寿命、破断様式、除外データの根拠"],
    caution: "部材や構造物へ適用する場合は、試験片との応力状態・表面・環境の差を別途評価します。",
  },
  "低サイクル": {
    aim: "繰返し塑性ひずみを伴う一軸疲労で、応力–ひずみ応答と寿命を取得します。",
    setup: ["全ひずみ範囲又はひずみ振幅、ひずみ比、ひずみ速度を定義", "伸び計又はひずみ計の装着・校正と軸合わせを確認", "温度、保持時間、雰囲気、サイクル中の制御量を固定"],
    outcomes: ["全・弾性・塑性ひずみ範囲", "ヒステリシスループと繰返し応力応答", "ひずみ–寿命曲線、繰返し硬化／軟化、Nf"],
    report: ["ひずみ制御条件、計測器、標点間距離", "温度履歴、保持、ひずみ速度、波形", "代表ループ、解析式・サイクル数の定義、破断判定"],
    caution: "高温又は保持を伴う場合は、時間依存ひずみ・緩和・クリープの扱いを明確にします。",
  },
  "変動振幅": {
    aim: "実使用を模した負荷時系列を与え、変動する振幅下での疲労寿命と損傷蓄積を整理します。",
    setup: ["荷重時系列の出所、サンプリング、編集・繰返し方法を記録", "最大・最小荷重、R比、波形、単一アクチュエータの制御精度を確認", "開始・終了条件、打切りサイクル、過負荷又は欠落データの扱いを定義"],
    outcomes: ["荷重時系列に対する破断又は打切り寿命", "サイクル計数結果とブロック別の損傷指標", "必要に応じて一定振幅結果との比較"],
    report: ["負荷時系列の取得元、編集手順、再生倍率、制御モード", "サイクル計数法、データ削減法、解析に使用したパラメータ", "試験片履歴、破断状況、寿命定義、除外データの根拠"],
    caution: "変動振幅試験の結果は、負荷時系列の編集方法と再生条件に強く依存するため、時系列そのものと処理手順を残します。",
  },
  "平面曲げ": {
    aim: "軸試験機に曲げ治具を組み合わせ、一定振幅の平面曲げ荷重に対する疲労寿命を評価します。",
    setup: ["平面曲げ治具、荷重点間距離、試験片断面・表面状態を確認", "力又は変位の振幅、応力比、波形、周波数、室温又は高温条件を設定", "曲げモーメントの校正、治具の芯ずれ、試験片の保持状態を点検"],
    outcomes: ["曲げ応力又はひずみ振幅–寿命データ", "破断位置・破面の観察記録", "必要に応じて応力比別の疲労曲線"],
    report: ["治具構成、荷重点間距離、試験片寸法・表面状態", "制御量、応力算出式、周波数、環境、破断検知方法", "寿命、破断様式、未破断データと打切り条件"],
    caution: "平面曲げは試験片の配置と治具剛性の影響を受けるため、荷重点・支点の寸法と荷重校正を明記します。",
  },
  "き裂進展": {
    aim: "繰返し荷重下のき裂成長抵抗を、き裂進展速度da/dNと応力拡大係数範囲ΔKの関係で整理します。",
    setup: ["試験片形式、寸法、採取方向、予き裂条件を定める", "荷重範囲、R比、周波数、波形、環境を管理", "光学・コンプライアンス・電位差等のき裂長さ測定法を選定"],
    outcomes: ["da/dN–ΔK曲線", "近しきい値域・安定進展域・不安定化域のデータ", "き裂長さ履歴、破面・き裂経路の観察"],
    report: ["試験片校正、予き裂、き裂長さ測定法と分解能", "ΔK、Kmax、R、荷重履歴、温度・環境", "データ削減方法、妥当性判定、残留応力・き裂閉口の所見"],
    caution: "残留応力、環境、R比、き裂閉口は結果解釈を大きく左右するため、未記載のまま比較しません。",
  },
  "試験系検証": {
    aim: "軸疲労試験システムが、指令どおりの一定振幅動的力を与えているかを確認します。",
    setup: ["ロードセル、制御器、治具、アライメントの識別と校正状態を確認", "検証する荷重レンジ、波形、周波数、繰返し数を定める", "実試験と同等又は代表的な治具・連結状態で評価"],
    outcomes: ["指令値と実測値の差", "振幅安定性、位相・波形の妥当性", "検証結果と適用レンジ"],
    report: ["検証日、機器識別、校正証明の参照", "検証条件、実測波形、許容基準", "判定、逸脱、再調整又は再検証の履歴"],
    caution: "試験機の検証結果と、個別規格の試験片・材料の適合性は別に確認します。",
  },
  "データ整理": {
    aim: "一定振幅疲労試験結果を比較・追跡可能な形で提示するためのデータ整備を行います。",
    setup: ["データ単位、寿命定義、破断・未破断の表記を統一", "応力／ひずみの定義、R比、表面状態、試験片群を整理", "外れ値・除外値・再試験の判断基準を計画書に明記"],
    outcomes: ["S–N又はε–Nの図表", "寿命統計、回帰又は設計用の整理データ", "試験条件と結果の対応表"],
    report: ["各データ点に対応する試験条件", "試料履歴、破断・打切り状態、観察所見", "統計処理、回帰式、信頼区間を使用した場合の方法"],
    caution: "異なる温度、R比、周波数、表面状態のデータを同一曲線として扱う際は、その妥当性を説明します。",
  },
  "複合負荷": {
    aim: "軸力とねじりを組み合わせ、複合ひずみ状態における疲労応答を評価します。",
    setup: ["薄肉管等の試験片形状と軸・ねじり方向の整合を確認", "軸・ねじりひずみ振幅、位相差、平均成分、波形を設定", "二軸計測、治具剛性、軸合わせ、温度を管理"],
    outcomes: ["軸・せん断応力／ひずみ履歴", "位相差を含む寿命データ", "多軸損傷指標を用いる場合の解析結果"],
    report: ["二軸制御条件、位相差、波形、計測系", "試験片寸法、肉厚、標点部のひずみ測定方法", "寿命定義、破断位置、採用した多軸評価式"],
    caution: "多軸評価式や等価ひずみの選定は、目的・材料・負荷経路に依存するため明記します。",
  },
  "回転曲げ": {
    aim: "回転する試験片に曲げ応力を繰返し与え、曲げ疲労寿命を求めます。",
    setup: ["試験片径、表面仕上げ、直線性、チャック状態を確認", "曲げモーメント、回転速度、応力振幅、温度を設定", "振れ、偏心、荷重校正、破断検知を確認"],
    outcomes: ["応力振幅–寿命データ", "破断位置・破面の観察", "細線等では曲げ半径・回転条件との対応"],
    report: ["試験片寸法、表面状態、採取方向", "回転速度、曲げ荷重、応力算出式、環境", "破断・未破断、寿命、破面又は異常の記録"],
    caution: "偏心や試験片の表面傷は寿命に影響するため、事前検査と記録を行います。",
  },
  "熱機械疲労": {
    aim: "温度履歴と機械ひずみを連成させ、熱機械環境下での繰返し損傷を評価します。",
    setup: ["温度波形、ひずみ波形、位相関係、保持時間を定義", "加熱方式、温度計測位置、温度均一性、雰囲気を確認", "高温用伸び計・治具、熱膨張補正、冷却条件を管理"],
    outcomes: ["温度–ひずみ–応力履歴", "熱機械疲労寿命、ヒステリシス応答", "保持・位相条件別の寿命又は損傷比較"],
    report: ["温度計測・校正、温度波形、位相、保持、雰囲気", "機械ひずみと熱ひずみの扱い、制御精度", "寿命定義、破断状況、酸化等の観察、解析方法"],
    caution: "温度の代表性と熱ひずみの分離方法は、結果の比較可能性に直結するため必ず示します。",
  },
  "動的弾性率": {
    aim: "衝撃加振又は共振を用い、弾性材料の動的ヤング率・剛性率等を求めます。",
    setup: ["試験片形状・寸法・密度・支持位置を確認", "加振位置、検出方法、共振モード、温度を定義", "十分に弾性的な応答域で、不要な拘束や接触を避ける"],
    outcomes: ["共振周波数", "動的ヤング率、剛性率、ポアソン比", "必要に応じて温度依存性・ばらつき"],
    report: ["試験片寸法、密度、支持・加振・検出方法", "採用モード、周波数、計算式・補正", "測定回数、平均・ばらつき、温度・雰囲気"],
    caution: "試験片の形状、密度、支持条件は算出値へ影響するため、原データと併せて残します。",
  },
  "制振・減衰": {
    aim: "材料の損失係数と弾性率を測定し、振動・騒音を抑える制振性能を評価します。",
    setup: ["片持ち梁等の試験片構成、寸法、接着・積層状態を定義", "温度、周波数、振幅、共振モード、境界条件を設定", "多層材では各層の厚さ・材料・組立条件を記録"],
    outcomes: ["損失係数η", "ヤング率又はせん断弾性率", "温度・周波数に対する制振特性"],
    report: ["試験片構成、寸法、層構成、接着条件", "周波数、温度、振幅、モード、計測方法", "η・弾性率の算出手順、再現性、外観観察"],
    caution: "制振材の特性は温度・周波数・拘束条件に依存するため、単一値だけで用途比較しません。",
  },
  "動的粘弾性": {
    aim: "温度・周波数又は時間に対する高分子材料の貯蔵・損失成分を測定し、粘弾性挙動を整理します。",
    setup: ["引張・曲げ・せん断・ねじり等の変形様式を選定", "試験片寸法、予備乾燥・調湿、振幅又はひずみを定義", "周波数、温度域、昇温／降温速度、雰囲気を設定し、線形粘弾性域を確認"],
    outcomes: ["貯蔵弾性率・損失弾性率又は複素弾性率", "tanδと遷移温度", "温度・周波数に対する曲線と材料比較"],
    report: ["測定モード、試験片寸法、前処理・調湿", "周波数、振幅、温度プログラム、雰囲気、計測器", "弾性率・tanδ曲線、遷移温度の判定基準、解析条件"],
    caution: "異なる変形様式、温度履歴、昇温速度で得たtanδピークは、同一条件でのみ比較します。",
  },
};

const standardTestGuides: Partial<Record<string, TestGuide>> = {
  "astm-d7791": {
    aim: "剛性又は半剛性プラスチックの一軸繰返し負荷に対する疲労抵抗を、引張又は圧縮で比較評価します。",
    setup: ["引張（手順A）又は圧縮（手順B）の負荷モードと、試験片形状・加工方向を定める", "応力・ひずみが概ね弾性域に収まる振幅、周波数、波形、平均荷重を設定", "引張／圧縮用治具、ロードセル、変位又はひずみ計の校正と軸合わせを確認"],
    outcomes: ["破断又は規定損傷までの繰返し数", "応力又はひずみ振幅–寿命データ", "試験片の発熱、変形、破断位置・破断様式の記録"],
    report: ["材料グレード、成形・加工履歴、試験片寸法、調湿条件", "負荷モード、応力又はひずみ振幅、周波数、波形、平均成分", "寿命、破断様式、温度上昇等の観察、打切り基準"],
    caution: "プラスチックでは試験周波数や自己発熱が結果へ影響します。試験片温度・変形状態を確認し、実使用条件との整合を説明します。",
  },
  "astm-d4482": {
    aim: "未切欠きゴム試験片に伸長・除荷を繰り返し与え、伸長サイクルに対する疲労寿命を比較評価します。",
    setup: ["ゴム配合、加硫又は成形条件、試験片寸法、外観を記録し、意図的な切欠きは導入しない", "伸長比又はひずみ条件、サイクル速度、波形、温度・雰囲気、破断判定を設定", "ゴムに適したグリップ、滑り防止、標点・チャック部の発熱と損傷を確認"],
    outcomes: ["破断までのサイクル数と疲労寿命分布", "伸長条件別の比較データ", "き裂開始・破断位置、外観変化、必要に応じた残留変形"],
    report: ["ゴムの種類・配合・加硫条件、試験片の採取位置と寸法", "伸長条件、サイクル速度、波形、環境、把持方法", "各試験片の破断寿命、き裂・破断の観察、統計的な整理方法"],
    caution: "ゴム疲労のばらつきは大きく、試験片数、試験片の欠陥・表面状態、発熱を記録しない比較は避けます。",
  },
  "astm-f2345": {
    aim: "人工股関節用セラミック製モジュラー大腿骨頭について、金属コーンとの組合せを含む繰返し荷重下の疲労強度を比較します。",
    setup: ["大腿骨頭、金属コーン、組立公差・表面状態を実使用仕様に沿って定義", "専用のコーン治具、荷重経路、生理食塩水等の試験環境、温度を構成", "繰返し荷重条件、周波数、破損検出、環境液の管理方法を定める"],
    outcomes: ["破損又は打切りまでの繰返し数", "セラミック頭部・コーン接触部の損傷・破壊状態", "設計・材料・製造条件別の相対的疲労性能"],
    report: ["部品の図面、材料、表面仕上げ、コーン形状・公差、組立条件", "専用治具、試験液、温度、荷重条件、周波数、破損検出方法", "寿命、破壊状況、試験後観察、逸脱及び環境管理の記録"],
    caution: "本規格は専用治具と生理学的環境を伴う医療用部品試験です。一般材料用の軸疲労試験と同一条件で扱わず、治具・環境構成の妥当性を確認します。",
  },
  "jis-k6270": {
    aim: "加硫ゴム又は熱可塑性ゴムに一定ひずみの引張繰返しを与え、引張疲労特性を評価します。",
    setup: ["試験片の材料状態、加硫・成形条件、寸法、採取方向を記録", "定ひずみ条件、サイクル速度、波形、温度、破断又は損傷判定を設定", "ゴム用グリップの滑り、つかみ部損傷、発熱を確認"],
    outcomes: ["破断又は規定損傷までの繰返し数", "一定ひずみ条件別の疲労寿命", "き裂開始・破断位置、外観変化"],
    report: ["規格番号・版、材料・配合・加硫条件、試験片寸法", "定ひずみ条件、サイクル速度、環境、把持方法", "寿命、破断様式、外観観察、打切り条件"],
    caution: "ゴムの疲労特性は温度上昇と試験片の表面状態に左右されます。試験中の発熱と異常な滑りを必ず確認します。",
  },
  "astm-e1820": {
    aim: "疲労予き裂を導入したCT又はSE(B)試験片について、K、J、CTOD又はR曲線でMode I破壊靭性を評価します。",
    setup: ["CT、SE(B)又はDC(T)試験片の寸法、切欠き、疲労予き裂の条件とき裂前縁を確認", "疲労試験機で予き裂を導入後、同じ試験機又は静的構成で荷重–COD／荷重–変位を高分解能で記録", "CTクレビス又は三点曲げ治具、CODクリップゲージ又は規格が認めるコンプライアンス計測を構成"],
    outcomes: ["K、J又はCTODの点値、必要に応じJ–Δa又はCTOD–ΔaのR曲線", "延性き裂開始、安定き裂進展又は不安定破壊の判定", "予き裂・延性き裂長さ、荷重–変位又は荷重–COD曲線"],
    report: ["試験片形状・寸法、材料状態、採取方向、切欠き・疲労予き裂条件", "治具、荷重計、COD又は変位計の識別・校正、試験速度・温度", "解析パラメータ、き裂長さ測定法、有効性判定、個別値とR曲線"],
    caution: "K、J、CTODの有効性は試験片寸法、流動応力、予き裂品質及びき裂成長量に依存します。規格の寸法・有効性判定を省略して材料定数として扱いません。",
  },
  "astm-e399": {
    aim: "疲労予き裂試験片を用い、強い引張拘束下における金属材料の線形弾性・平面ひずみ破壊靭性KICを評価します。",
    setup: ["CT、SE(B)等の規定試験片について、板厚・リガメント・切欠き・疲労予き裂長さを確認", "疲労試験機で予き裂を導入し、CTクレビス又は三点曲げ治具で規定速度の荷重–変位試験を実施", "変位ゲージ、荷重計、試験片寸法計測及び予き裂前縁の確認方法を準備"],
    outcomes: ["暫定値KQ及び有効性を満たす場合のKIC", "荷重–変位記録、Pmax/PQ判定、試験片寸法の有効性", "疲労予き裂の形状、破面及び残留応力に関する観察"],
    report: ["材料状態、熱処理・溶接・加工履歴、採取方向、試験片図面", "疲労予き裂条件、試験治具、荷重速度、変位計測、環境", "KQ、KIC、有効性判定、無効時の理由及び破面観察"],
    caution: "塑性変形が大きい材料・寸法が不足する試験片では有効なKICが得られません。その場合はJ又はCTODを扱うE1820・ISO 12135を検討します。",
  },
  "astm-e1921": {
    aim: "フェライト鋼のへき開破壊に対するKJcデータから、遷移温度域のマスターカーブ基準温度T0を統計的に求めます。",
    setup: ["複数のSE(B)、C(T)又はDC(T)試験片に疲労予き裂を導入し、材料の均質性と採取位置を確認", "低温又は遷移温度域を維持できる環境槽・温度計測と、規定K速度の荷重–変位計測を構成", "試験片厚さ、拘束条件、試験数及び温度点を、統計評価の要求に沿って計画"],
    outcomes: ["個別KJc値、基準温度T0、マスターカーブ及び許容限界", "試験温度、試験片形状・寸法とデータばらつきの関係", "へき開破壊の発生状況とデータ母集団の均質性評価"],
    report: ["鋼種、強度、熱処理・溶接状態、採取位置、試験片の種類・厚さ", "予き裂条件、試験温度、K速度、温度測定、荷重–変位記録", "全KJcデータ、T0の算定法、外れ値・均質性判定、マスターカーブ"],
    caution: "T0は試験片形状、拘束、温度、材料の不均質性に影響されます。C(T)とSE(B)の値を混在比較する際は、規格の取り扱いに従います。",
  },
  "iso-12135": {
    aim: "均質な金属材料の準静的破壊靭性を、K、CTOD、J及びR曲線で評価します。",
    setup: ["切欠き・疲労予き裂を導入したCT又は曲げ試験片について、寸法・き裂長さ・予き裂品質を確認", "島津疲労試験機にCTクレビス又は三点曲げ治具、CODクリップゲージ又は変位計、高分解能荷重計を組み合わせる", "ゆっくりした変位増加の荷重–変位／荷重–COD試験を行い、必要に応じ温度・環境を管理"],
    outcomes: ["K、CTOD又はJの点値、安定延性き裂進展時のR曲線", "き裂開始・不安定破壊の判定、荷重–変位又は荷重–COD曲線", "き裂進展量、試験片有効性及び試験片間のばらつき"],
    report: ["材料、試験片、切欠き・予き裂、試験片寸法と採取方向", "治具、計測器、変位速度、温度・環境、き裂長さ測定法", "靭性パラメータ、R曲線、解析方法、有効性判定、破面観察"],
    caution: "本規格はき裂停止靭性を対象としません。溶接部はISO 15653を併用し、へき開破壊の統計評価は別途検討します。",
  },
  "iso-15653": {
    aim: "溶接金属又は熱影響部の狙い位置を明確にした疲労予き裂試験片で、K、CTOD及びJによる準静的破壊靭性を評価します。",
    setup: ["溶接後に切欠き位置を決め、溶接金属又はHAZを狙って疲労予き裂を導入", "CT又は曲げ治具、CODクリップゲージ又は変位計、高分解能荷重計を構成し、準静的に負荷", "マクロ組織・硬さ等で狙い位置を確認し、予き裂前縁が対象領域を適切にサンプリングしているか評価"],
    outcomes: ["溶接部のK、CTOD又はJの点値", "予き裂及び破壊位置と溶接金属・HAZとの対応", "荷重–変位又は荷重–COD曲線、破面・マクロ断面の記録"],
    report: ["継手形状、溶接方法・材料、熱入力、PWHT、試験片の採取位置", "切欠き・予き裂位置、治具、COD又は変位計、試験速度・温度", "靭性値、有効性、狙い位置の確認方法、破面・組織観察"],
    caution: "本規格は溶接部の点値評価を主対象とします。R曲線の評価にはISO 12135を併用し、き裂の狙い位置を裏付ける観察を残します。",
  },
  "astm-c1421": {
    aim: "先進セラミックスの室温KICを、規定した梁試験片の鋭いき裂又はノッチを用いて評価します。",
    setup: ["予き裂梁、表面き裂曲げ又はシェブロンノッチ梁の方法を選び、材料・試験片形状を規格に合わせる", "島津試験機に三点又は四点曲げ治具を構成し、荷重計・変位計を校正", "予き裂又は表面き裂の寸法確認、支点間距離、試験速度、室温環境を管理"],
    outcomes: ["KIpb、KIsc又はKIvbとしての破壊靭性", "破壊荷重、き裂・ノッチ寸法、破面及び破壊起点", "方法ごとのKIC比較と試験片間ばらつき"],
    report: ["材料組成・密度・加工状態、試験片寸法、き裂又はノッチの作製・測定方法", "曲げ治具、支点間距離、荷重速度、計測器、温度・湿度", "破壊荷重、KIC算出式、試験方法、有効性、破面観察"],
    caution: "セラミックスはき裂・ノッチの方法により得られる値の意味が異なります。自然欠陥相当の小き裂と大きな鋭いき裂の結果を同一視しません。",
  },
  "astm-d5045": {
    aim: "プラスチックのKICとGICを、SENB又はCT試験片で求め、き裂発生に対する平面ひずみ破壊抵抗を評価します。",
    setup: ["SENB又はCT試験片の板厚・切欠き・鋭いき裂を規格の平面ひずみ条件に合わせる", "三点曲げ又はCT引張治具、ロードセル、変位計を構成し、荷重–変位を記録", "成形履歴、加工方向、調湿・温度、負荷速度を試験計画で定める"],
    outcomes: ["KIC及びGIC、荷重–変位曲線、き裂発生時の荷重", "試験片寸法と平面ひずみ・線形性の有効性判定", "加工方向・成形履歴別の破壊抵抗比較"],
    report: ["樹脂グレード、成形・加工履歴、き裂方向、試験片寸法・前処理", "試験形状、治具、荷重速度、環境、変位計測", "KIC・GIC、有効性判定、き裂観察、除外データの根拠"],
    caution: "KIC・GICは負荷速度、温度、環境及び成形方向に依存します。必要な板厚を確保できない場合は有効値として扱えません。",
  },
  "jis-r1607": {
    aim: "緻密質ファインセラミックスの室温破壊靭性を、規定した予き裂又はノッチを用いた曲げ試験で評価します。",
    setup: ["対象が緻密質ファインセラミックスであり、連続繊維強化材・多孔体ではないことを確認", "選択した予き裂導入又はノッチ方法に応じて試験片を作製し、き裂寸法を測定", "島津試験機に曲げ治具、荷重計、必要な変位計を構成し、室温で規定の荷重条件を与える"],
    outcomes: ["室温破壊靭性値、破壊荷重、き裂又はノッチ寸法", "破壊起点・破面の観察、試験片間ばらつき", "方法別に得られた値と適用範囲"],
    report: ["材料、焼結・加工状態、試験片寸法、き裂又はノッチの作製・測定方法", "曲げ治具、荷重速度、荷重計・変位計、室温条件", "破壊靭性値、算出式、破面観察、適用外材料の確認"],
    caution: "本規格の適用対象外である連続繊維強化セラミックス・多孔体には適用しません。材料と試験方法の組合せを原規格票で確認します。",
  },
};

function getTestGuide(standard: Standard): TestGuide {
  return standardTestGuides[standard.id] ?? testGuides[standard.category] ?? testGuides["軸力制御"];
}

function AuthorityPill({ authority }: { authority: Authority }) {
  return <span className={`authority-pill ${authorityStyles[authority]}`}>{authority}</span>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [authority, setAuthority] = useState<Authority | "すべて">("すべて");
  const [category, setCategory] = useState("すべて");
  const [materialFilter, setMaterialFilter] = useState("すべて");
  const [hasJis, setHasJis] = useState(false);
  const [selectedId, setSelectedId] = useState("iso-1099");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"detail" | "list">("list");

  const filteredStandards = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return standards.filter((standard) => {
      const matchesQuery = !normalized || [standard.code, standard.englishTitle, standard.japaneseTitle, standard.category, standard.method, standard.material, standard.materials?.join(" "), standard.relatedJis]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
      const matchesAuthority = authority === "すべて" || standard.authority === authority;
      const matchesCategory = category === "すべて" || standard.category === category;
      const matchesMaterial = materialFilter === "すべて" || standard.materials?.includes(materialFilter) || standard.material.includes(materialFilter);
      const matchesJis = !hasJis || standard.relatedJis !== "—";
      return matchesQuery && matchesAuthority && matchesCategory && matchesMaterial && matchesJis;
    });
  }, [query, authority, category, materialFilter, hasJis]);

  const selected = filteredStandards.find((standard) => standard.id === selectedId) ?? filteredStandards[0] ?? standards[0];
  const selectedMonitor = catalogueMonitor.records[selected.id];
  const detailGuide = getTestGuide(selected);
  const selectedMaterials = selected.materials ?? [selected.material];
  const sameThemeStandards = standards.filter((standard) => standard.category === selected.category && standard.id !== selected.id && (standard.materials ?? [standard.material]).some((material) => selectedMaterials.includes(material)));
  const crossReferenceStandard = selected.relatedJis === "—" ? undefined : standards.find((standard) => standard.code === selected.relatedJis);
  const relatedStandards = Array.from(new Map([...sameThemeStandards, ...(crossReferenceStandard ? [crossReferenceStandard] : [])].map((standard) => [standard.id, standard])).values());
  const authorityCounts = useMemo(() => ({
    ASTM: standards.filter((item) => item.authority === "ASTM").length,
    ISO: standards.filter((item) => item.authority === "ISO").length,
    JIS: standards.filter((item) => item.authority === "JIS").length,
  }), []);

  function clearFilters() {
    setQuery("");
    setAuthority("すべて");
    setCategory("すべて");
    setMaterialFilter("すべて");
    setHasJis(false);
  }

  function selectSameThemeStandard(standardId: string) {
    clearFilters();
    setSelectedId(standardId);
    setMobileView("detail");
  }

  return (
    <div className="catalogue-shell">
      <main className="catalogue-main">
        <section className="catalogue-intro-section" aria-labelledby="catalogue-title">
          <div className="catalogue-heading"><p className="eyebrow">STANDARD CATALOGUE</p><h1 id="catalogue-title">規格目録</h1></div>
          <div className="search-surface">
            <Search className="search-icon" size={23} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例：ISO 1099、動的粘弾性、金属材料、制振" aria-label="規格を検索" />
            {query && <button className="clear-query" onClick={() => setQuery("")} aria-label="検索語をクリア"><X size={20} /></button>}
            <button className="search-submit" aria-label="検索結果を表示"><ArrowRight size={23} /></button>
          </div>
          <button className="filters-toggle" onClick={() => setIsFiltersOpen((value) => !value)} aria-expanded={isFiltersOpen} aria-controls="catalogue-filters"><SlidersHorizontal size={16} /><span>{isFiltersOpen ? "絞り込み条件を閉じる" : "規格体系・試験領域・材料で絞り込む"}</span><ChevronRight size={17} /></button>
          <div id="catalogue-filters" className={`filters catalogue-filters ${isFiltersOpen ? "is-expanded" : ""}`} aria-label="規格フィルタ">
            <div className="filter-group"><span className="filter-label"><SlidersHorizontal size={16} /> 規格体系</span>{(["すべて", "ASTM", "ISO", "JIS"] as const).map((item) => <button key={item} className={`filter-button ${authority === item ? "selected" : ""}`} onClick={() => { setAuthority(item); setMobileView("list"); }}>{item}</button>)}</div>
            <div className="filter-group category-group"><span className="filter-label"><Filter size={16} /> 試験領域</span><div className="category-scroll">{categories.map((item) => <button key={item} className={`category-chip ${category === item ? "selected" : ""}`} onClick={() => { setCategory(item); setMobileView("list"); }}>{item}</button>)}</div></div>
            <div className="filter-group category-group"><span className="filter-label"><FlaskConical size={16} /> 材料</span><div className="category-scroll">{materialFilters.map((item) => <button key={item} className={`category-chip ${materialFilter === item ? "selected" : ""}`} onClick={() => { setMaterialFilter(item); setMobileView("list"); }}>{item}</button>)}</div></div>
            <label className="switch-control"><input type="checkbox" checked={hasJis} onChange={(event) => { setHasJis(event.target.checked); setMobileView("list"); }} /><span className="switch-track"><span /></span> 対応・関連JISあり</label>
          </div>
        </section>

        <div className="mobile-view-switch" aria-label="規格表示の切替"><button className={mobileView === "list" ? "selected" : ""} onClick={() => setMobileView("list")}>規格一覧 <span>{filteredStandards.length}</span></button><button className={mobileView === "detail" ? "selected" : ""} onClick={() => setMobileView("detail")}>選択中の規格内容</button></div>
        <section className={`catalogue-results mobile-${mobileView}`} aria-label="検索結果と規格詳細">
          <div className="results-panel">
          <div className="results-heading"><div><span className="result-number">{String(filteredStandards.length).padStart(2, "0")}</span><span> 件の規格</span><span className="data-update-status">データ自動更新日：{formatCheckDate(catalogueMonitor.lastCompletedAt)} · {catalogueMonitor.latestRun?.checked ?? 0}/{standards.length}件</span></div>{(query || authority !== "すべて" || category !== "すべて" || materialFilter !== "すべて" || hasJis) && <button onClick={clearFilters} className="reset-button"><X size={17} /> 条件を解除</button>}</div>
            <div className="standard-list">
              {filteredStandards.length > 0 ? filteredStandards.map((standard, index) => <button key={standard.id} className={`standard-row ${selected.id === standard.id ? "selected" : ""}`} onClick={() => { setSelectedId(standard.id); setMobileView("detail"); }}><div className="row-index">{String(index + 1).padStart(2, "0")}</div><div className="row-main"><div className="row-code"><AuthorityPill authority={standard.authority} /><span>{standard.code}</span>{standard.status === "new" && <b>NEW</b>}</div><h3>{standard.japaneseTitle}</h3><p>{standard.englishTitle}</p></div><div className="row-tags"><span>{standard.category}</span><span>{standard.material}</span></div><ChevronRight className="row-arrow" size={22} /></button>) : <div className="empty-state"><FlaskConical size={30} /><h3>一致する規格がありません。</h3><p>別の規格番号、試験方法、材料、または広い試験領域で再検索してください。</p><button onClick={clearFilters}>すべての規格を見る</button></div>}
            </div>
          </div>

          <aside className="detail-panel" aria-label="選択中の規格詳細">
            <div className="detail-topline"><span>SELECTED STANDARD</span><span>{selected.edition}</span></div>
            <div className="detail-code"><AuthorityPill authority={selected.authority} /><a className="detail-code-link" href={selected.source} target="_blank" rel="noreferrer" aria-label={`${selected.code}の公式個別規格ページを開く`} title="公式個別規格ページを開く"><code>{selected.code}</code><ArrowUpRight size={16} aria-hidden="true" /></a></div>
            <h2>{selected.japaneseTitle}</h2><p className="detail-english">{selected.englishTitle}</p><div className="official-scope"><p className="eyebrow">{selected.authority === "ASTM" ? "OFFICIAL SCOPE / SIGNIFICANCE · 日本語要約" : "OFFICIAL SCOPE · 日本語要約"}</p><p className="detail-summary">{officialScopeSummaries[selected.id] ?? selected.summary}</p></div>
            <div className="detail-facts"><div><span>試験領域</span><strong>{selected.category}</strong></div><div><span>制御・方法</span><strong>{selected.method}</strong></div><div><span>対象材料</span><strong>{selected.material}</strong></div><div><span>公式ページ確認日</span><strong>{formatCheckDate(selectedMonitor?.checkedAt)}{selectedMonitor?.pendingReview ? " · 要確認" : selectedMonitor?.lastError ? " · 未取得" : ""}</strong></div></div>
            <section className="same-theme" aria-labelledby="same-theme-title">
              <div className="same-theme-heading"><div><p className="eyebrow">RELATED STANDARDS</p><h3 id="same-theme-title">関連規格</h3></div><span>{selected.category}</span></div>
              {relatedStandards.length > 0 ? <div className="same-theme-list">{relatedStandards.map((standard) => { const isCrossReference = standard.id === crossReferenceStandard?.id; return <button key={standard.id} onClick={() => selectSameThemeStandard(standard.id)}><span className="same-theme-code"><AuthorityPill authority={standard.authority} /> <code>{standard.code}</code></span><span className="relation-flags">{isCrossReference && <b>ISO / JIS 対応</b>}{standard.category === selected.category && <i>同一テーマ</i>}</span><strong>{standard.japaneseTitle}</strong>{isCrossReference && <p>{selected.relation}</p>}<ChevronRight size={18} /></button>; })}</div> : <p className="same-theme-empty">この目録には、関連する別規格がまだありません。</p>}
            </section>
            <section className="test-guide" aria-label={`${selected.code}の試験要件とレポート項目`}><div className="test-guide-heading"><span>TEST BRIEF</span><span>計画・結果・報告</span></div><p className="test-guide-aim">{detailGuide.aim}</p><div className="test-guide-columns"><div><h3>試験内容・条件</h3><ul>{detailGuide.setup.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>主要な試験結果</h3><ul>{detailGuide.outcomes.map((item) => <li key={item}>{item}</li>)}</ul></div></div><div className="report-checklist"><h3>レポートに記載する内容</h3><ul>{detailGuide.report.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></div><p className="test-guide-caution">{detailGuide.caution}</p></section>
            <a className="source-link" href={selected.source} target="_blank" rel="noreferrer">{selected.sourceLabel}<ArrowUpRight size={18} /></a>
          </aside>
        </section>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f3ec] text-[#1f262d] selection:bg-[#0b4aa2] selection:text-white">
      <aside className={`portal-sidebar ${isSidebarOpen ? "is-open" : ""}`} aria-label="主要ナビゲーション">
        <div className="sidebar-brand">
          <img className="brand-mark" src="/manus-storage/specimen-loop-mark_1b787ba1.png" alt="Fatigue Indexのシンボル" />
          <div>
            <p className="brand-name">FATIGUE<br /><span>/ INDEX</span></p>
            <p className="brand-subtitle">STANDARDS PORTAL</p>
          </div>
          <button className="mobile-close" onClick={() => setIsSidebarOpen(false)} aria-label="メニューを閉じる"><X size={20} /></button>
        </div>

        <nav className="sidebar-nav">
          <a className="active" href="#catalogue" onClick={() => setIsSidebarOpen(false)}><span className="nav-coordinate">01</span><BookOpen size={17} /> 規格目録 <span>{standards.length}</span></a>
          <a href="#equipment" onClick={() => setIsSidebarOpen(false)}><span className="nav-coordinate">02</span><FlaskConical size={17} /> 参考装置</a>
          <a href="#guide" onClick={() => setIsSidebarOpen(false)}><span className="nav-coordinate">03</span><FileSearch size={17} /> 使い方</a>
          <a href="#sources" onClick={() => setIsSidebarOpen(false)}><span className="nav-coordinate">04</span><ExternalLink size={17} /> 出典・確認</a>
        </nav>

        <div className="sidebar-rule" />
        <div className="sidebar-scope">
          <p className="eyebrow">CATALOGUE SCOPE</p>
          <p>疲労・動的試験・動特性を横断する、材料別の参照目録。</p>
          <dl>
            <div><dt>ASTM</dt><dd>{authorityCounts.ASTM}</dd></div>
            <div><dt>ISO</dt><dd>{authorityCounts.ISO}</dd></div>
            <div><dt>JIS</dt><dd>{authorityCounts.JIS}</dd></div>
          </dl>
        </div>

        <div className="sidebar-footer">
          <span className="live-dot" /> 収載情報：2026.08 確認
        </div>
      </aside>

      <main className="portal-main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setIsSidebarOpen(true)} aria-label="メニューを開く"><Menu size={22} /></button>
          <div className="mobile-wordmark"><img src="/manus-storage/specimen-loop-mark_1b787ba1.png" alt="" /><span>FATIGUE<br /><b>/ INDEX</b></span></div>
          <div className="crumb"><span>資料室</span><ChevronRight size={14} /><strong>疲労・動特性</strong></div>
          <div className="topbar-note"><span /> 規格本文ではなく、探索のための参照目録です。</div>
        </header>

        <div className="document-rail" aria-hidden="true"><strong>F/I</strong><span>00</span><i /><span>01</span><i /><span>02</span><i /><span>03</span><i /><span>04</span></div>

        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <div className="eyebrow with-rule">FATIGUE &amp; DYNAMIC PROPERTIES</div>
            <h1 id="page-title">規格の交点から、<br /><em>試験計画へ。</em></h1>
            <p>ASTM・ISO・JISを横断し、疲労試験、動的試験、動的粘弾性・制振特性の規格を、材料別に辿ります。</p>
            <div className="hero-meta"><span>ASTM / ISO / JIS</span><span>EXPANDED CATALOGUE</span></div>
            <a className="hero-catalogue-link" href="#catalogue"><span>EXPLORE / {standards.length} RECORDS</span><ArrowRight size={15} /></a>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <img src="/manus-storage/fatigue-hero_52fcf225.png" alt="" />
          </div>
        </section>

        <section id="catalogue" className="catalogue-section" aria-labelledby="catalogue-title">
          <div className="section-kicker"><span>01</span><div><p className="eyebrow">STANDARD CATALOGUE</p><h2 id="catalogue-title">規格を検索する</h2></div></div>
          <p className="catalogue-intro">規格番号、試験方法、材料、キーワードから絞り込みます。各レコードは可能な限り規格機関の個別規格ページへ接続します。</p>

          <div className="search-surface">
            <Search className="search-icon" size={20} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例：動的粘弾性、ISO 6721、金属材料、制振" aria-label="規格を検索" />
            {query && <button className="clear-query" onClick={() => setQuery("")} aria-label="検索語をクリア"><X size={17} /></button>}
            <button className="search-submit" aria-label="検索結果を表示"><ArrowRight size={20} /></button>
          </div>

          <div className="filters" aria-label="規格フィルタ">
            <div className="filter-group">
              <span className="filter-label"><SlidersHorizontal size={14} /> 規格体系</span>
              {(["すべて", "ASTM", "ISO", "JIS"] as const).map((item) => (
                <button key={item} className={`filter-button ${authority === item ? "selected" : ""}`} onClick={() => setAuthority(item)}>{item}</button>
              ))}
            </div>
            <div className="filter-group category-group">
              <span className="filter-label"><Filter size={14} /> 試験領域</span>
              <div className="category-scroll">{categories.map((item) => (
                <button key={item} className={`category-chip ${category === item ? "selected" : ""}`} onClick={() => setCategory(item)}>{item}</button>
              ))}</div>
            </div>
            <div className="filter-group category-group">
              <span className="filter-label"><FlaskConical size={14} /> 材料</span>
              <div className="category-scroll">{materialFilters.map((item) => (
                <button key={item} className={`category-chip ${materialFilter === item ? "selected" : ""}`} onClick={() => setMaterialFilter(item)}>{item}</button>
              ))}</div>
            </div>
            <label className="switch-control"><input type="checkbox" checked={hasJis} onChange={(event) => setHasJis(event.target.checked)} /><span className="switch-track"><span /></span> 対応・関連JISあり</label>
          </div>
        </section>

        <section className="results-layout" aria-label="検索結果と規格詳細">
          <div className="results-panel">
            <div className="results-heading">
              <div><span className="result-number">{String(filteredStandards.length).padStart(2, "0")}</span><span> 件の規格</span></div>
              {(query || authority !== "すべて" || category !== "すべて" || materialFilter !== "すべて" || hasJis) && <button onClick={clearFilters} className="reset-button"><X size={15} /> 条件を解除</button>}
            </div>

            <div className="standard-list">
              {filteredStandards.length > 0 ? filteredStandards.map((standard, index) => (
                <button key={standard.id} className={`standard-row ${selected.id === standard.id ? "selected" : ""}`} onClick={() => setSelectedId(standard.id)}>
                  <div className="row-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="row-main"><div className="row-code"><AuthorityPill authority={standard.authority} /><span>{standard.code}</span>{standard.status === "new" && <b>NEW</b>}</div><h3>{standard.japaneseTitle}</h3><p>{standard.englishTitle}</p></div>
                  <div className="row-tags"><span>{standard.category}</span><span>{standard.material}</span></div>
                  <ChevronRight className="row-arrow" size={20} />
                </button>
              )) : (
                <div className="empty-state"><FlaskConical size={25} /><h3>一致する規格がありません。</h3><p>別の規格番号、試験方法、または広い試験領域で再検索してください。</p><button onClick={clearFilters}>すべての規格を見る</button></div>
              )}
            </div>
          </div>

          <aside className="detail-panel" aria-label="選択中の規格詳細">
            <div className="detail-topline"><span>SELECTED RECORD</span><span>{selected.edition}</span></div>
            <div className="detail-code"><AuthorityPill authority={selected.authority} /><code>{selected.code}</code></div>
            <h2>{selected.japaneseTitle}</h2>
            <p className="detail-english">{selected.englishTitle}</p>
            <p className="detail-summary">{selected.summary}</p>
            <div className="detail-facts"><div><span>試験領域</span><strong>{selected.category}</strong></div><div><span>制御・方法</span><strong>{selected.method}</strong></div><div><span>対象材料</span><strong>{selected.material}</strong></div></div>
            <div className="related-jis"><div className="related-label"><span>ISO / JIS CROSS-REFERENCE</span><ArrowRight size={16} /></div><strong>{selected.relatedJis}</strong><p>{selected.relation}</p></div>
            <div className="scope-notes"><p className="eyebrow">INDEX NOTES</p>{selected.notes.map((note) => <span key={note}><Check size={14} /> {note}</span>)}</div>
            <section className="test-guide" aria-label={`${selected.code}の試験要件とレポート項目`}>
              <div className="test-guide-heading"><span>TEST BRIEF</span><span>計画・結果・報告</span></div>
              <p className="test-guide-aim">{detailGuide.aim}</p>
              <div className="test-guide-columns">
                <div><h3>試験内容・条件</h3><ul>{detailGuide.setup.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><h3>主要な試験結果</h3><ul>{detailGuide.outcomes.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </div>
              <div className="report-checklist"><h3>レポートに記載する内容</h3><ul>{detailGuide.report.map((item) => <li key={item}><Check size={13} />{item}</li>)}</ul></div>
              <p className="test-guide-caution">{detailGuide.caution}</p>
            </section>
            <a className="source-link" href={selected.source} target="_blank" rel="noreferrer">{selected.sourceLabel}<ArrowUpRight size={16} /></a>
          </aside>
        </section>

        <section id="equipment" className="equipment-section" aria-labelledby="equipment-title">
          <div className="section-kicker"><span>02</span><div><p className="eyebrow">REFERENCE TEST SYSTEMS</p><h2 id="equipment-title">試験計画を支える、<br />参考装置構成。</h2></div></div>
          <p className="equipment-intro">規格の適合性は、試験機の型式だけでは確定しません。ここでは、ご指定の島津製作所の公式情報をもとに、試験方式・環境・部品評価を検討する際の参考装置として整理しています。</p>
          <div className="equipment-grid">
            <article className="equipment-card equipment-card-emt"><div className="equipment-photo"><span>REF. 02-A</span><img src="/manus-storage/shimadzu-emt-system_1806a799.webp" alt="島津製作所 EMTシリーズの電磁式疲労・耐久試験システム" /></div><div className="equipment-copy"><p className="eyebrow">ELECTROMAGNETIC / HIGH-CYCLE</p><h3>EMTシリーズ</h3><p>電磁力を駆動源とする疲労・耐久試験システム。高速繰返し試験、広い試験空間、恒温槽を用いた環境試験の検討に対応する参考構成です。</p><dl><div><dt>駆動</dt><dd>電磁式</dd></div><div><dt>仕様例</dt><dd>最大 2 m/s</dd></div><div><dt>ストローク</dt><dd>±50 mm</dd></div></dl><a href="https://www.an.shimadzu.co.jp/products/materials-testing/fatigue-testingimpact-testing/emt-series/index.html" target="_blank" rel="noreferrer">島津製作所 EMTシリーズ <ArrowUpRight size={15} /></a></div></article>
            <article className="equipment-card"><div className="equipment-photo equipment-photo-ehf"><span>REF. 02-B</span><img src="/manus-storage/shimadzu-ehf-e-system_9943944d.png" alt="島津製作所 EHF-Eシリーズの電気油圧式サーボ疲労試験機" /></div><div className="equipment-copy"><p className="eyebrow">ELECTROHYDRAULIC / COMPONENT</p><h3>EHF-Eシリーズ</h3><p>材料疲労から小型部品の性能・耐久評価までを想定したサーボパルサ。高温・恒温環境、熱疲労、破壊靱性評価と組み合わせる際の参考構成です。</p><dl><div><dt>駆動</dt><dd>電気油圧サーボ</dd></div><div><dt>定格例</dt><dd>50–500 kN</dd></div><div><dt>対象</dt><dd>材料・小型部品</dd></div></dl><a href="https://www.an.shimadzu.co.jp/products/materials-testing/fatigue-testingimpact-testing/ehf-e-series/index.html" target="_blank" rel="noreferrer">島津製作所 EHF-Eシリーズ <ArrowUpRight size={15} /></a></div></article>
          </div>
          <p className="equipment-notice">装置写真・仕様の出典：島津製作所の各製品個別ページ。掲載内容は参考情報であり、規格への適合には、実際の装置構成、校正、治具、計測器、試験条件の個別確認が必要です。</p>
        </section>

        <section id="guide" className="guide-section" aria-labelledby="guide-title">
          <div className="guide-image"><img src="/manus-storage/fatigue-micrograph_7febfbcb.png" alt="疲労破面を想起させる金属組織のイメージ" /></div>
          <div className="guide-copy"><div className="section-kicker"><span>03</span><div><p className="eyebrow">HOW TO READ</p><h2 id="guide-title">対応表記は、<br />試験条件を省略しない。</h2></div></div><p>同じ「疲労試験」でも、制御量、温度、試験片、負荷波形、結果の取り扱いは規格ごとに異なります。このポータルでは、規格番号の近接性を「関連」として示し、同等性を断定しません。</p><a href="#sources" className="text-link">出典と確認上の注意を読む <ArrowRight size={17} /></a></div>
        </section>

        <section id="sources" className="sources-section" aria-labelledby="sources-title">
          <div className="section-kicker"><span>04</span><div><p className="eyebrow">SOURCE &amp; NOTICE</p><h2 id="sources-title">原典で確認するために</h2></div></div>
          <div className="sources-grid"><div><h3>掲載方針</h3><p>規格本文は掲載せず、公開メタデータをもとに、規格探索に必要な番号、版、題名、試験領域を整理しています。改正・廃止・対比関係は、試験計画に用いる前に必ず公式規格票で確認してください。</p></div><div><h3>公式個別ページ</h3><p>詳細パネルの「個別規格ページ」から、ASTM、ISO、JISの該当規格を直接開けます。規格体系の集約ページではなく、各レコード固有の参照先を優先しています。</p></div><div className="dynamic-card"><img src="/manus-storage/dynamic-loading-abstract_f1f80002.png" alt="周期荷重を表す抽象ビジュアル" /><p>規格の発行年だけでは適用可否を判断できません。</p><span>CHECK / SCOPE / EDITION</span></div></div>
        </section>

        <footer className="portal-footer"><div className="footer-brand"><img src="/manus-storage/specimen-loop-mark_1b787ba1.png" alt="" /><span>FATIGUE<br /><b>/ INDEX</b></span></div><span>Expanded catalogue · {standards.length} records · 2026.08</span><span>資料探索のための参照ポータル</span></footer>
      </main>
    </div>
  );
}
