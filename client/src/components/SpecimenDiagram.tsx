/**
 * Style context: Quiet technical catalogue. Monochrome engineering-line drawings use the portal's deep blue
 * only for load paths and measurement references, keeping the figure secondary to the standard text.
 */
import type { ReactNode } from "react";
import { ArrowUpRight, Info } from "lucide-react";

export type SpecimenFigureKind =
  | "axial"
  | "round"
  | "ct"
  | "seb"
  | "notched-beam"
  | "bend-beam"
  | "plane-bending"
  | "tube"
  | "impulse-beam"
  | "damping-beam"
  | "dma";

export type SpecimenFigure = {
  kind: SpecimenFigureKind;
  title: string;
  purpose: string;
  dimensions: Array<{ symbol: string; label: string }>;
  sourceBasis: string;
};

type StandardFigureInput = {
  id: string;
  category: string;
};

const crackGrowthCtIds = new Set(["astm-e647", "iso-12108", "jis-t0310"]);
const fractureCtIds = new Set(["astm-e1820", "astm-e399", "astm-e1921", "iso-12135", "iso-15653"]);
const ceramicBendIds = new Set(["astm-c1421", "jis-r1607"]);
const axialCategories = new Set(["軸力制御", "低サイクル", "変動振幅", "熱機械疲労"]);

const ctDimensions = [
  { symbol: "W", label: "試験片幅（荷重線から背面まで）" },
  { symbol: "H", label: "試験片全高" },
  { symbol: "B", label: "板厚" },
  { symbol: "a₀", label: "初期き裂長さ（荷重線基準）" },
  { symbol: "b₀ = W − a₀", label: "初期リガメント" },
];

export function getSpecimenFigure({ id, category }: StandardFigureInput): SpecimenFigure | undefined {
  if (crackGrowthCtIds.has(id)) {
    return {
      kind: "ct",
      title: "C(T) 試験片（Compact Tension）",
      purpose: "疲労予き裂を導入した試験片に繰返し荷重を与え、き裂長さの進展を記録してda/dN–ΔK関係を整理する代表的なMode I形状です。",
      dimensions: ctDimensions,
      sourceBasis: "ASTM E647及びISO 12108は、C(T)を含む複数の試験片形状を対象とします。JIS T 0310は金属系生体材料のき裂進展を扱います。試験片形状、予き裂条件、き裂長さ測定法及び有効性条件は規格本文で決めます。",
    };
  }

  if (fractureCtIds.has(id)) {
    return {
      kind: "ct",
      title: "C(T) 試験片（Compact Tension）",
      purpose: "疲労予き裂を起点として、荷重–変位又は荷重–CODを記録する代表的なMode I試験片です。",
      dimensions: ctDimensions,
      sourceBasis: "C(T)はASTM E1820で推奨される代表試験片の一つです。E399、E1921、ISO 12135・ISO 15653では、規格本文に従って予き裂、寸法及び有効性条件を決めます。",
    };
  }

  if (ceramicBendIds.has(id)) {
    return {
      kind: "notched-beam",
      title: "き裂／ノッチ付き梁試験片（四点曲げ）",
      purpose: "四点曲げの内側二点に荷重を与え、き裂又はノッチを基準に破壊荷重から破壊靭性を整理する代表形状です。",
      dimensions: [
        { symbol: "W", label: "梁高さ（曲げ方向寸法）" },
        { symbol: "B", label: "幅（紙面奥行）" },
        { symbol: "Sₒ", label: "外側支点間距離" },
        { symbol: "Sᵢ", label: "内側荷重点間距離" },
        { symbol: "a₀", label: "き裂／ノッチ深さ" },
      ],
      sourceBasis: "ASTM C1421・JIS R 1607は、予き裂梁、表面き裂又はシェブロンノッチなど複数の方法を規定します。方法により三点曲げ構成及びスパン比が異なるため、原典で確認します。",
    };
  }

  if (id === "astm-d5045") {
    return {
      kind: "seb",
      title: "SE(B)／SENB 試験片（三点曲げ）",
      purpose: "三点曲げで疲労予き裂を開口させ、荷重–変位からKICとGICを評価する代表形状です。",
      dimensions: [
        { symbol: "W", label: "梁高さ（曲げ方向寸法）" },
        { symbol: "B", label: "板厚（紙面奥行）" },
        { symbol: "S", label: "支点間距離" },
        { symbol: "a₀", label: "初期き裂長さ（切欠き＋予き裂）" },
      ],
      sourceBasis: "ASTM D5045はSENB又はCT形状を対象とし、KICとGICを評価します。負荷速度、試験片厚さ及び平面ひずみ条件の確認が必要です。",
    };
  }

  if (category === "複合負荷") {
    return {
      kind: "tube",
      title: "薄肉管試験片（軸力–ねじり）",
      purpose: "軸方向力とトルクを同時に加え、標点部の軸ひずみ・せん断ひずみ履歴を計測する代表形状です。",
      dimensions: [
        { symbol: "Dₒ", label: "外径" },
        { symbol: "Dᵢ", label: "内径" },
        { symbol: "t", label: "肉厚 t = (Dₒ − Dᵢ) / 2" },
        { symbol: "Lᵍ", label: "標点長さ" },
      ],
      sourceBasis: "ASTM E2207は、軸方向ひずみとせん断ひずみを組み合わせた、ひずみ制御の疲労試験手順を対象とします。",
    };
  }

  if (category === "回転曲げ") {
    return {
      kind: "round",
      title: "丸棒試験片（四点回転曲げ）",
      purpose: "外側二点で支持し内側二点に荷重を与えて純曲げ区間をつくり、試験片を軸まわりに回転させて表面起点の疲労寿命を整理する代表形状です。",
      dimensions: [
        { symbol: "d", label: "平行部径" },
        { symbol: "Lᵍ", label: "平行部長さ" },
        { symbol: "R", label: "肩部半径" },
        { symbol: "L", label: "全長" },
      ],
      sourceBasis: "ISO 1143・JIS Z 2274は回転曲げ疲労を対象とし、片持ち形式と四点（純曲げ）形式を扱います。平行部の表面状態、直線性、振れ及び曲げモーメントの校正が結果解釈に影響します。",
    };
  }

  if (id === "iso-22407") {
    return {
      kind: "plane-bending",
      title: "平板試験片（軸方向平面曲げ）",
      purpose: "一端をクランプし、自由端に一定振幅の曲げ変位又は力を与えて、常に同一平面内で曲げ疲労を評価する代表形状です。",
      dimensions: [
        { symbol: "L", label: "クランプから負荷点までの自由長" },
        { symbol: "w", label: "幅（紙面奥行）" },
        { symbol: "t", label: "厚さ" },
        { symbol: "δ", label: "変位振幅（変位制御時）" },
      ],
      sourceBasis: "ISO 22407は、軸試験機に平面曲げ治具を組み合わせ、一定振幅の平面曲げを与える試験方法です。治具構成、拘束条件及び制御量を試験条件とともに記録します。",
    };
  }

  if (id === "jis-r1621") {
    return {
      kind: "bend-beam",
      title: "矩形梁試験片（四点曲げ疲労）",
      purpose: "外側二点で支持し内側二点に繰返し荷重を与え、内側スパンを一定曲げモーメント区間として曲げ疲労を評価する代表形状です。",
      dimensions: [
        { symbol: "L", label: "試験片長さ" },
        { symbol: "h", label: "高さ（曲げ方向寸法）" },
        { symbol: "b", label: "幅（紙面奥行）" },
        { symbol: "Sₒ", label: "外側支点間距離" },
        { symbol: "Sᵢ", label: "内側荷重点間距離" },
      ],
      sourceBasis: "JIS R 1621は、室温・大気中でファインセラミックスの曲げ疲労を四点曲げ構成で評価します。試験片の面取り・仕上げ、治具の支点半径及び荷重比を記録します。",
    };
  }

  if (category === "動的弾性率") {
    return {
      kind: "impulse-beam",
      title: "矩形梁試験片（衝撃加振・共振）",
      purpose: "曲げ振動の節位置で支持した梁の中央を打撃し、共振周波数から動的弾性率を求める代表形状です。",
      dimensions: [
        { symbol: "L", label: "試験片長さ" },
        { symbol: "w", label: "幅（紙面奥行）" },
        { symbol: "t", label: "厚さ（曲げ方向寸法）" },
        { symbol: "Lₙ", label: "端部から節（支持）位置までの距離" },
      ],
      sourceBasis: "ASTM E1876は衝撃加振による動的弾性率・せん断弾性率・ポアソン比の測定を対象とします。寸法に加えて質量（密度）と支持・打撃・検出位置が結果に影響します。",
    };
  }

  if (category === "制振・減衰") {
    return {
      kind: "damping-beam",
      title: "片持ち梁試験片（基材＋減衰材）",
      purpose: "一端をクランプした梁を非接触で加振し、自由長側の応答から共振周波数と損失係数を求める代表形状です。",
      dimensions: [
        { symbol: "L", label: "クランプから自由端までの自由長" },
        { symbol: "w", label: "幅（紙面奥行）" },
        { symbol: "t₁", label: "基材（ベースビーム）厚さ" },
        { symbol: "t₂", label: "減衰材層の厚さ" },
      ],
      sourceBasis: "ASTM E756は、均一梁、片面貼付（Oberst）梁及びサンドイッチ梁の構成で、振動減衰特性を測定します。基材特性、層構成及びクランプ条件を結果と併せて扱います。",
    };
  }

  if (category === "動的粘弾性") {
    return {
      kind: "dma",
      title: "短冊形試験片（DMA）",
      purpose: "クランプ間に正弦波状の力又は変位を与え、応力とひずみの振幅比及び位相差から動的粘弾性を求める代表形状です。",
      dimensions: [
        { symbol: "L", label: "全長" },
        { symbol: "Lᵍ", label: "標点長さ（クランプ間距離）" },
        { symbol: "w", label: "幅" },
        { symbol: "t", label: "厚さ（紙面奥行）" },
      ],
      sourceBasis: "ASTM D4065、ISO 6721及びJIS K 7244では、変形モード、試験片寸法、前処理、振幅、周波数及び温度プログラムを組み合わせて報告します。図は引張モードの例です。",
    };
  }

  if (axialCategories.has(category)) {
    return {
      kind: "axial",
      title: "平板・丸棒試験片（一軸負荷）",
      purpose: "掴み部間の平行部に軸方向の繰返し荷重又はひずみを与え、標点部の応力・ひずみ・寿命を対応付ける代表形状です。",
      dimensions: [
        { symbol: "Lᵍ", label: "標点長さ（平行部）" },
        { symbol: "w / d", label: "平行部の幅／径" },
        { symbol: "t", label: "板厚（平板試験片）" },
        { symbol: "R", label: "肩部半径" },
      ],
      sourceBasis: "一軸疲労規格では、試験片の材料状態、形状、表面状態及び採取方向を負荷条件とともに記録します。規格・材料製品規格で指定される試験片タイプを優先します。",
    };
  }

  return undefined;
}

type DimExt = Array<[number, number]>;

function DimH({ x1, x2, y, label, ext = [] }: { x1: number; x2: number; y: number; label: string; ext?: DimExt }) {
  return <g className="specimen-dimension">
    {ext.map(([x, from]) => <line key={`h${x}-${from}`} x1={x} y1={from} x2={x} y2={from < y ? y + 6 : y - 6} />)}
    <line x1={x1} y1={y} x2={x2} y2={y} markerStart="url(#figure-arrow)" markerEnd="url(#figure-arrow)" />
    <text x={(x1 + x2) / 2} y={y - 7} textAnchor="middle">{label}</text>
  </g>;
}

function DimV({ x, y1, y2, label, side = "right", ext = [] }: { x: number; y1: number; y2: number; label: string; side?: "left" | "right"; ext?: DimExt }) {
  return <g className="specimen-dimension">
    {ext.map(([y, from]) => <line key={`v${y}-${from}`} x1={from} y1={y} x2={from < x ? x + 6 : x - 6} y2={y} />)}
    <line x1={x} y1={y1} x2={x} y2={y2} markerStart="url(#figure-arrow)" markerEnd="url(#figure-arrow)" />
    <text x={side === "right" ? x + 8 : x - 8} y={(y1 + y2) / 2} textAnchor={side === "right" ? "start" : "end"} dominantBaseline="central">{label}</text>
  </g>;
}

function Note({ x, y, text, anchor = "start" }: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end" }) {
  return <text className="specimen-note" x={x} y={y} textAnchor={anchor}>{text}</text>;
}

function Mark({ x, y, text, anchor = "start" }: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end" }) {
  return <text className="specimen-label" x={x} y={y} textAnchor={anchor}>{text}</text>;
}

function Leader({ d, x, y, text, anchor = "start" }: { d: string; x: number; y: number; text: string; anchor?: "start" | "middle" | "end" }) {
  return <g><path className="specimen-leader" d={d} /><Note x={x} y={y} text={text} anchor={anchor} /></g>;
}

/** One arrow per path: SVG places marker-end only on the last vertex, so each load path stays single-segment. */
function Arrow({ d, className = "specimen-load", both = false }: { d: string; className?: string; both?: boolean }) {
  return <path className={className} d={d} markerEnd="url(#figure-arrow)" markerStart={both ? "url(#figure-arrow)" : undefined} />;
}

function Figure({ title, children }: { title: string; children: ReactNode }) {
  return <svg className="specimen-svg" viewBox="0 0 560 300" role="img" aria-label={title}>
    <title>{title}</title>
    <defs><marker id="figure-arrow" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 8 4 L 0 8 z" /></marker></defs>
    {children}
  </svg>;
}

function AxialFigure() {
  return <Figure title="一軸疲労試験片の寸法記号図">
    <path className="specimen-fill" d="M90 104H160C174 104 176 122 190 122H370C384 122 386 104 400 104H470V176H400C386 176 384 158 370 158H190C176 158 174 176 160 176H90Z" />
    <path className="specimen-grip" d="M106 104V176M122 104V176M438 104V176M454 104V176" />
    <Arrow d="M78 140H32" />
    <Arrow d="M482 140H528" />
    <Mark x={55} y={131} anchor="middle" text="F" />
    <Mark x={505} y={131} anchor="middle" text="F" />
    <Leader d="M180 112L152 84" x={148} y={81} anchor="end" text="R（肩部半径）" />
    <DimH x1={190} x2={370} y={214} label="Lᵍ" ext={[[190, 158], [370, 158]]} />
    <DimV x={300} y1={122} y2={158} label="w / d" />
    <Note x={32} y={266} text="t：板厚（平板試験片の紙面奥行方向）" />
    <Note x={528} y={266} anchor="end" text="掴み部の形状・寸法は規格及び治具構成に従います" />
  </Figure>;
}

function CtFigure() {
  return <Figure title="C(T)試験片の寸法記号図">
    <path className="specimen-fill" d="M132 34H320V214H132V136H222L228 124L222 112H132Z" />
    <circle className="specimen-hole" cx="170" cy="83" r="19" />
    <circle className="specimen-hole" cx="170" cy="165" r="19" />
    <path className="specimen-crack" d="M228 124H245M245 117V131" />
    <Arrow d="M170 64V14" />
    <Arrow d="M170 184V234" />
    <Mark x={182} y={24} text="P" />
    <Mark x={182} y={232} text="P" />
    <path className="specimen-centerline" d="M170 214V286" />
    <Leader d="M186 70L220 50" x={224} y={47} text="荷重ピン孔" />
    <Leader d="M247 120L276 92" x={280} y={89} text="疲労予き裂" />
    <DimV x={348} y1={34} y2={214} label="H" ext={[[34, 320], [214, 320]]} />
    <DimH x1={170} x2={245} y={258} label="a₀" ext={[[245, 124]]} />
    <DimH x1={245} x2={320} y={258} label="b₀" ext={[[320, 214]]} />
    <DimH x1={170} x2={320} y={280} label="W" ext={[[320, 214]]} />
    <Note x={32} y={294} text="B：板厚（紙面奥行方向）" />
    <Note x={528} y={294} anchor="end" text="W 及び a₀ は荷重線（ピン孔中心線）を基準に測定します" />
  </Figure>;
}

function SebFigure() {
  return <Figure title="SE(B)三点曲げ試験片の寸法記号図">
    <path className="specimen-fill" d="M100 110H460V190H283V158H277V190H100Z" />
    <path className="specimen-crack" d="M280 158V144" />
    <circle className="specimen-support" cx="280" cy="101" r="9" />
    <circle className="specimen-support" cx="150" cy="199" r="9" />
    <circle className="specimen-support" cx="410" cy="199" r="9" />
    <path className="specimen-support" d="M116 213H184M376 213H444" />
    <Arrow d="M280 56V82" />
    <Mark x={292} y={66} text="P" />
    <DimH x1={150} x2={410} y={244} label="S" ext={[[150, 208], [410, 208]]} />
    <DimV x={488} y1={110} y2={190} label="W" ext={[[110, 460], [190, 460]]} />
    <DimV x={314} y1={190} y2={144} label="a₀" ext={[[190, 283], [144, 280]]} />
    <Note x={32} y={272} text="B：板厚（紙面奥行方向）" />
    <Note x={528} y={272} anchor="end" text="a₀：機械切欠きと疲労予き裂を合わせた初期き裂長さ" />
  </Figure>;
}

function NotchedBeamFigure() {
  return <Figure title="き裂／ノッチ付き梁試験片（四点曲げ）の寸法記号図">
    <path className="specimen-fill" d="M100 110H460V190H283V156H277V190H100Z" />
    <path className="specimen-crack" d="M280 156V146" />
    <circle className="specimen-support" cx="220" cy="101" r="9" />
    <circle className="specimen-support" cx="340" cy="101" r="9" />
    <circle className="specimen-support" cx="140" cy="199" r="9" />
    <circle className="specimen-support" cx="420" cy="199" r="9" />
    <path className="specimen-support" d="M106 213H174M386 213H454" />
    <Arrow d="M220 58V84" />
    <Arrow d="M340 58V84" />
    <Mark x={228} y={76} text="F/2" />
    <Mark x={348} y={76} text="F/2" />
    <DimH x1={220} x2={340} y={42} label="Sᵢ" ext={[[220, 56], [340, 56]]} />
    <DimH x1={140} x2={420} y={266} label="Sₒ" ext={[[140, 208], [420, 208]]} />
    <DimV x={488} y1={110} y2={190} label="W" ext={[[110, 460], [190, 460]]} />
    <DimV x={314} y1={190} y2={146} label="a₀" ext={[[190, 283], [146, 280]]} />
    <Note x={32} y={288} text="B：幅（紙面奥行方向）" />
    <Note x={528} y={288} anchor="end" text="方法により三点曲げ構成を規定する場合があります" />
  </Figure>;
}

function BendBeamFigure() {
  return <Figure title="矩形梁試験片（四点曲げ疲労）の寸法記号図">
    <path className="specimen-fill" d="M100 112H460V188H100Z" />
    <circle className="specimen-support" cx="220" cy="103" r="9" />
    <circle className="specimen-support" cx="340" cy="103" r="9" />
    <circle className="specimen-support" cx="140" cy="197" r="9" />
    <circle className="specimen-support" cx="420" cy="197" r="9" />
    <path className="specimen-support" d="M106 211H174M386 211H454" />
    <Arrow d="M220 58V86" />
    <Arrow d="M340 58V86" />
    <Mark x={228} y={76} text="F/2" />
    <Mark x={348} y={76} text="F/2" />
    <DimH x1={220} x2={340} y={42} label="Sᵢ" ext={[[220, 56], [340, 56]]} />
    <DimH x1={140} x2={420} y={244} label="Sₒ" ext={[[140, 206], [420, 206]]} />
    <DimH x1={100} x2={460} y={268} label="L" ext={[[100, 188], [460, 188]]} />
    <DimV x={488} y1={112} y2={188} label="h" ext={[[112, 460], [188, 460]]} />
    <Note x={32} y={292} text="b：幅（紙面奥行方向）" />
    <Note x={528} y={292} anchor="end" text="内側二点に繰返し荷重を与え、外側二点で支持します" />
  </Figure>;
}

function PlaneBendingFigure() {
  return <Figure title="平板試験片（軸方向平面曲げ）の寸法記号図">
    <path className="specimen-fill" d="M60 130H470V158H60Z" />
    <rect className="specimen-support" x="44" y="96" width="16" height="96" />
    <rect className="specimen-support" x="60" y="100" width="80" height="30" />
    <rect className="specimen-support" x="60" y="158" width="80" height="30" />
    <path className="specimen-centerline" d="M140 144H470" />
    <path className="specimen-deflection" d="M140 144C264 144 400 138 470 100" />
    <path className="specimen-deflection" d="M140 144C264 144 400 150 470 188" />
    <Arrow d="M520 102V186" both />
    <Mark x={528} y={144} text="±δ" />
    <DimV x={488} y1={130} y2={158} label="t" ext={[[130, 470], [158, 470]]} />
    <DimH x1={140} x2={470} y={236} label="L" ext={[[140, 192], [470, 192]]} />
    <Note x={132} y={212} anchor="end" text="クランプ（固定端）" />
    <Note x={32} y={266} text="w：幅（紙面奥行方向）" />
    <Note x={528} y={266} anchor="end" text="力制御又は変位制御で一定振幅の平面曲げを与えます" />
  </Figure>;
}

function TubeFigure() {
  return <Figure title="薄肉管試験片（軸力–ねじり）の寸法記号図">
    <path className="specimen-fill" fillRule="evenodd" d="M110 88H400V168H110ZM110 102H400V154H110Z" />
    <path className="specimen-leader" d="M180 88V102M180 154V168M330 88V102M330 154V168" />
    <path className="specimen-centerline" d="M104 128H406" />
    <rect className="specimen-support" x="64" y="76" width="54" height="104" />
    <rect className="specimen-support" x="392" y="76" width="54" height="104" />
    <Arrow d="M58 128H18" />
    <Arrow d="M452 128H510" />
    <Mark x={34} y={120} anchor="middle" text="F" />
    <Mark x={482} y={120} anchor="middle" text="F" />
    <Arrow d="M100 66A30 30 0 0 1 154 56" className="specimen-torque" />
    <Arrow d="M410 66A30 30 0 0 0 356 56" className="specimen-torque" />
    <Mark x={160} y={54} text="T" />
    <Mark x={350} y={54} anchor="end" text="T" />
    <DimH x1={180} x2={330} y={196} label="Lᵍ" ext={[[180, 168], [330, 168]]} />
    <Note x={255} y={216} anchor="middle" text="標点部（軸ひずみ・せん断ひずみ計測区間）" />
    <circle className="specimen-fill" cx="492" cy="208" r="38" />
    <circle className="specimen-inner" cx="492" cy="208" r="25" />
    <Note x={492} y={158} anchor="middle" text="軸直角断面" />
    <Leader d="M492 176L536 150" x={536} y={146} anchor="end" text="t" />
    <DimH x1={454} x2={530} y={266} label="Dₒ" ext={[[454, 208], [530, 208]]} />
    <DimH x1={467} x2={517} y={288} label="Dᵢ" ext={[[467, 208], [517, 208]]} />
  </Figure>;
}

function RoundFigure() {
  return <Figure title="丸棒試験片（四点回転曲げ）の寸法記号図">
    <path className="specimen-fill" d="M60 100H150C172 100 178 116 200 116H360C382 116 388 100 410 100H500V164H410C388 164 382 148 360 148H200C178 148 172 164 150 164H60Z" />
    <path className="specimen-centerline" d="M46 132H296M332 132H524" />
    <rect className="specimen-support" x="64" y="88" width="32" height="88" />
    <rect className="specimen-support" x="112" y="88" width="32" height="88" />
    <rect className="specimen-support" x="416" y="88" width="32" height="88" />
    <rect className="specimen-support" x="464" y="88" width="32" height="88" />
    <Arrow d="M128 52V84" />
    <Arrow d="M432 52V84" />
    <Mark x={136} y={66} text="F/2" />
    <Mark x={440} y={66} text="F/2" />
    <Arrow d="M80 212V180" />
    <Arrow d="M480 212V180" />
    <Arrow d="M40 104A28 28 0 0 0 40 160" className="specimen-rotation" />
    <Mark x={24} y={98} anchor="middle" text="ω" />
    <Leader d="M374 153L402 186" x={406} y={189} text="R（肩部半径）" />
    <DimV x={300} y1={116} y2={148} label="d" />
    <DimH x1={200} x2={360} y={232} label="Lᵍ" ext={[[200, 148], [360, 148]]} />
    <DimH x1={60} x2={500} y={256} label="L" ext={[[60, 164], [500, 164]]} />
    <Note x={280} y={282} anchor="middle" text="外側＝支持ベアリング／内側＝負荷ベアリング（内側の間が純曲げ区間）" />
  </Figure>;
}

function ImpulseBeamFigure() {
  return <Figure title="矩形梁試験片（衝撃加振・共振）の寸法記号図">
    <path className="specimen-fill" d="M90 128H470V162H90Z" />
    <circle className="specimen-support" cx="175" cy="169" r="7" />
    <circle className="specimen-support" cx="385" cy="169" r="7" />
    <Arrow d="M280 76V124" />
    <Note x={292} y={94} text="打撃（インパルス加振）" />
    <rect className="specimen-support" x="406" y="170" width="34" height="16" />
    <Note x={446} y={183} text="応答検出" />
    <DimH x1={90} x2={175} y={212} label="Lₙ" ext={[[90, 162], [175, 176]]} />
    <DimH x1={385} x2={470} y={212} label="Lₙ" ext={[[385, 176], [470, 162]]} />
    <DimH x1={90} x2={470} y={238} label="L" ext={[[90, 162], [470, 162]]} />
    <DimV x={496} y1={128} y2={162} label="t" ext={[[128, 470], [162, 470]]} />
    <Note x={32} y={268} text="w：幅（紙面奥行方向）" />
    <Note x={528} y={268} anchor="end" text="曲げ振動の節位置で支持し、中央を打撃して共振周波数を測定します" />
  </Figure>;
}

function DampingBeamFigure() {
  return <Figure title="片持ち梁試験片（基材＋減衰材）の寸法記号図">
    <path className="specimen-fill" d="M60 134H470V154H60Z" />
    <rect className="specimen-layer" x="130" y="120" width="340" height="14" />
    <rect className="specimen-support" x="44" y="92" width="16" height="104" />
    <rect className="specimen-support" x="60" y="104" width="70" height="30" />
    <rect className="specimen-support" x="60" y="154" width="70" height="30" />
    <rect className="specimen-support" x="150" y="70" width="42" height="24" />
    <rect className="specimen-support" x="412" y="70" width="42" height="24" />
    <Arrow d="M171 96V116" />
    <Arrow d="M433 116V96" />
    <Note x={198} y={86} text="加振（非接触）" />
    <Note x={406} y={86} anchor="end" text="応答（非接触）" />
    <DimH x1={130} x2={470} y={232} label="L" ext={[[130, 184], [470, 154]]} />
    <DimV x={496} y1={134} y2={154} label="t₁" ext={[[134, 470], [154, 470]]} />
    <DimV x={526} y1={120} y2={134} label="t₂" ext={[[120, 470], [134, 470]]} />
    <Note x={124} y={206} anchor="end" text="クランプ（固定端）" />
    <Note x={32} y={266} text="w：幅（紙面奥行方向）" />
    <Note x={528} y={266} anchor="end" text="自由長 L のはり共振から損失係数と複素弾性率を求めます" />
  </Figure>;
}

function DmaFigure() {
  return <Figure title="DMA短冊形試験片の寸法記号図">
    <path className="specimen-fill" d="M70 126H490V154H70Z" />
    <rect className="specimen-support" x="70" y="98" width="48" height="84" />
    <rect className="specimen-support" x="442" y="98" width="48" height="84" />
    <Arrow d="M62 140H20" both />
    <Arrow d="M498 140H540" both />
    <Mark x={41} y={130} anchor="middle" text="±F" />
    <Mark x={519} y={130} anchor="middle" text="±F" />
    <DimV x={160} y1={126} y2={154} label="w" />
    <DimH x1={118} x2={442} y={216} label="Lᵍ" ext={[[118, 182], [442, 182]]} />
    <DimH x1={70} x2={490} y={242} label="L" ext={[[70, 182], [490, 182]]} />
    <Note x={32} y={272} text="t：厚さ（紙面奥行方向）" />
    <Note x={528} y={272} anchor="end" text="変形モード（引張・曲げ・せん断・ねじり）は規格に従います" />
  </Figure>;
}

function FigureSvg({ kind }: { kind: SpecimenFigureKind }) {
  if (kind === "ct") return <CtFigure />;
  if (kind === "seb") return <SebFigure />;
  if (kind === "notched-beam") return <NotchedBeamFigure />;
  if (kind === "bend-beam") return <BendBeamFigure />;
  if (kind === "plane-bending") return <PlaneBendingFigure />;
  if (kind === "tube") return <TubeFigure />;
  if (kind === "round") return <RoundFigure />;
  if (kind === "impulse-beam") return <ImpulseBeamFigure />;
  if (kind === "damping-beam") return <DampingBeamFigure />;
  if (kind === "dma") return <DmaFigure />;
  return <AxialFigure />;
}

export function SpecimenDiagram({ figure, sourceUrl, sourceLabel }: { figure: SpecimenFigure; sourceUrl: string; sourceLabel: string }) {
  return <section className="specimen-figure" aria-labelledby="specimen-figure-title">
    <div className="specimen-figure-heading"><div><p className="eyebrow">SPECIMEN SCHEMATIC</p><h3 id="specimen-figure-title">{figure.title}</h3></div><span>寸法記号図</span></div>
    <FigureSvg kind={figure.kind} />
    <p className="specimen-purpose">{figure.purpose}</p>
    <div className="specimen-dimension-key" aria-label="寸法記号の説明">{figure.dimensions.map((dimension) => <span key={dimension.symbol}><b>{dimension.symbol}</b>{dimension.label}</span>)}</div>
    <p className="specimen-source-basis"><Info size={15} />{figure.sourceBasis}</p>
    <p className="specimen-copyright-note">本図は規格票の図面・寸法表を転載しない新規の概念図です。最終寸法、比率、許容範囲及び有効性条件は、必ず最新版の規格本文で確認してください。</p>
    <a className="specimen-source-link" href={sourceUrl} target="_blank" rel="noreferrer"><span>出典：{sourceLabel}</span><ArrowUpRight size={15} /></a>
  </section>;
}
