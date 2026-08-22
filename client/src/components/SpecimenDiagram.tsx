/**
 * Style context: Quiet technical catalogue. Monochrome engineering-line drawings use the portal's deep blue
 * only for load paths and measurement references, keeping the figure secondary to the standard text.
 */
import { ArrowUpRight, Info } from "lucide-react";

export type SpecimenFigureKind = "axial" | "round" | "ct" | "seb" | "notched-beam" | "tube" | "free-beam" | "dma";

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

const fractureCtIds = new Set(["astm-e647", "astm-e1820", "astm-e399", "astm-e1921", "iso-12135", "iso-15653"]);
const fractureSebIds = new Set(["astm-d5045", "astm-c1421", "jis-r1607"]);

export function getSpecimenFigure({ id, category }: StandardFigureInput): SpecimenFigure | undefined {
  if (fractureCtIds.has(id)) {
    return {
      kind: "ct",
      title: "C(T) 試験片（Compact Tension）",
      purpose: "疲労予き裂を起点として、荷重–変位又は荷重–CODを記録する代表的なMode I試験片です。",
      dimensions: [
        { symbol: "W", label: "試験片幅" },
        { symbol: "B", label: "板厚" },
        { symbol: "a₀", label: "初期き裂長さ" },
        { symbol: "b₀ = W − a₀", label: "初期リガメント" },
      ],
      sourceBasis: "C(T)はASTM E1820で推奨される代表試験片の一つです。E647、E399、E1921、ISO 12135・ISO 15653では、規格本文に従って予き裂、寸法及び有効性条件を決めます。",
    };
  }

  if (fractureSebIds.has(id)) {
    return {
      kind: id === "astm-c1421" || id === "jis-r1607" ? "notched-beam" : "seb",
      title: id === "astm-c1421" || id === "jis-r1607" ? "き裂／ノッチ付き梁試験片" : "SE(B)／SENB 試験片",
      purpose: id === "astm-c1421" || id === "jis-r1607"
        ? "三点又は四点曲げで破壊荷重を記録し、き裂又はノッチを基準に破壊靭性を整理する代表形状です。"
        : "三点曲げで疲労予き裂を開口させ、荷重–変位又は荷重–CODから破壊靭性を評価する代表形状です。",
      dimensions: [
        { symbol: "W", label: "梁高さ" },
        { symbol: "B", label: "板厚" },
        { symbol: "S", label: "支点間距離" },
        { symbol: "a₀", label: "初期き裂／ノッチ長さ" },
      ],
      sourceBasis: id === "astm-d5045"
        ? "ASTM D5045はSENB又はCT形状を対象とし、KICとGICを評価します。"
        : "ASTM C1421・JIS R 1607では、材料・方法に適合した鋭いき裂又はノッチを用いる梁試験を対象とします。",
    };
  }

  if (category === "複合負荷") {
    return {
      kind: "tube",
      title: "薄肉管試験片（軸力–ねじり）",
      purpose: "軸方向力とトルクを同時に加え、標点部の軸・せん断ひずみ履歴を計測する代表形状です。",
      dimensions: [
        { symbol: "Dₒ", label: "外径" },
        { symbol: "Dᵢ", label: "内径" },
        { symbol: "t", label: "肉厚" },
        { symbol: "Lᵍ", label: "標点長さ" },
      ],
      sourceBasis: "ASTM E2207は、軸方向ひずみとせん断ひずみを組み合わせた、ひずみ制御の疲労試験手順を対象とします。",
    };
  }

  if (category === "回転曲げ") {
    return {
      kind: "round",
      title: "丸棒試験片（回転曲げ）",
      purpose: "平滑な平行部へ回転曲げモーメントを与え、表面起点の疲労寿命を整理する代表形状です。",
      dimensions: [
        { symbol: "d", label: "平行部径" },
        { symbol: "Lᵍ", label: "平行部長さ" },
        { symbol: "R", label: "肩部半径" },
        { symbol: "L", label: "全長" },
      ],
      sourceBasis: "回転曲げ疲労では、平行部の表面状態、直線性、振れ及び曲げモーメントの校正が結果解釈に影響します。",
    };
  }

  if (category === "平面曲げ") {
    return {
      kind: "free-beam",
      title: "矩形梁試験片（平面曲げ）",
      purpose: "曲げ治具の支点・荷重点に対し、試験片の断面と支点間距離を対応付けて曲げ疲労を評価する代表形状です。",
      dimensions: [
        { symbol: "L", label: "試験片長さ" },
        { symbol: "w", label: "幅" },
        { symbol: "t", label: "厚さ" },
        { symbol: "S", label: "支点間距離" },
      ],
      sourceBasis: "曲げ疲労では、治具構成・支点間距離・荷重校正を試験条件とともに記録します。",
    };
  }

  if (category === "動的弾性率" || category === "制振・減衰") {
    return {
      kind: "free-beam",
      title: "矩形梁試験片（共振・曲げ）",
      purpose: "支持点、加振点又はクランプに対する試験片寸法を基に、共振周波数・減衰又は動的弾性率を整理する代表形状です。",
      dimensions: [
        { symbol: "L", label: "長さ" },
        { symbol: "w", label: "幅" },
        { symbol: "t", label: "厚さ" },
        { symbol: "S", label: "支持間距離" },
      ],
      sourceBasis: "ASTM E1876、ASTM E756の手順では、試験片形状、質量又は層構成、支持・加振条件を結果と併せて扱います。",
    };
  }

  if (category === "動的粘弾性") {
    return {
      kind: "dma",
      title: "短冊形試験片（DMA）",
      purpose: "引張・曲げ・せん断又はねじりモードに対応する試験片の標点部寸法を示す概念図です。",
      dimensions: [
        { symbol: "Lᵍ", label: "標点長さ" },
        { symbol: "w", label: "幅" },
        { symbol: "t", label: "厚さ" },
        { symbol: "L", label: "全長" },
      ],
      sourceBasis: "ASTM D4065、ISO 6721及びJIS K 7244では、変形モード、試験片寸法、前処理、振幅、周波数及び温度プログラムを組み合わせて報告します。",
    };
  }

  if (["軸力制御", "低サイクル", "変動振幅", "熱機械疲労"].includes(category)) {
    return {
      kind: "axial",
      title: "平板・丸棒試験片（一軸負荷）",
      purpose: "グリップ間の平行部に軸方向の繰返し荷重又はひずみを与え、標点部の応力・ひずみ・寿命を対応付ける代表形状です。",
      dimensions: [
        { symbol: "Lᵍ", label: "標点長さ" },
        { symbol: "w / d", label: "平行部の幅／径" },
        { symbol: "t", label: "板厚（平板）" },
        { symbol: "R", label: "肩部半径" },
      ],
      sourceBasis: "一軸疲労規格では、試験片の材料状態、形状、表面状態及び採取方向を負荷条件とともに記録します。規格・材料製品規格で指定される試験片タイプを優先します。",
    };
  }

  return undefined;
}

function DimensionLine({ x1, y1, x2, y2, label, vertical = false }: { x1: number; y1: number; x2: number; y2: number; label: string; vertical?: boolean }) {
  const labelX = (x1 + x2) / 2;
  const labelY = (y1 + y2) / 2;
  return <g className="specimen-dimension"><line x1={x1} y1={y1} x2={x2} y2={y2} markerStart="url(#figure-arrow)" markerEnd="url(#figure-arrow)" /><text x={labelX} y={labelY - (vertical ? 0 : 6)} textAnchor="middle" dominantBaseline={vertical ? "central" : undefined}>{label}</text></g>;
}

function FigureSvg({ kind }: { kind: SpecimenFigureKind }) {
  const defs = <defs><marker id="figure-arrow" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 8 4 L 0 8 z" /></marker></defs>;

  if (kind === "ct") return <svg className="specimen-svg" viewBox="0 0 520 280" role="img" aria-label="C(T)試験片の寸法記号図"><title>C(T)試験片の寸法記号図</title>{defs}<path className="specimen-fill" d="M145 46H335V105L294 140L335 175V234H145Z" /><circle className="specimen-hole" cx="194" cy="103" r="16" /><circle className="specimen-hole" cx="194" cy="178" r="16" /><path className="specimen-crack" d="M335 140H264M264 128v24" /><path className="specimen-load" d="M194 70V28M194 210v42" markerEnd="url(#figure-arrow)" markerStart="url(#figure-arrow)" /><text className="specimen-label" x="220" y="29">P</text><DimensionLine x1={145} y1={258} x2={335} y2={258} label="W" /><DimensionLine x1={360} y1={46} x2={360} y2={234} label="W" vertical /><DimensionLine x1={243} y1={121} x2={335} y2={121} label="a₀" /><text className="specimen-note" x="354" y="146">疲労予き裂</text><text className="specimen-note" x="170" y="151">B：板厚（紙面奥行）</text></svg>;

  if (kind === "seb" || kind === "notched-beam") return <svg className="specimen-svg" viewBox="0 0 520 280" role="img" aria-label="三点曲げ梁試験片の寸法記号図"><title>三点曲げ梁試験片の寸法記号図</title>{defs}<path className="specimen-fill" d="M80 115H440V182H80Z" /><path className="specimen-crack" d="M260 182V136M251 145l9-9 9 9" /><path className="specimen-load" d="M260 45V95" markerEnd="url(#figure-arrow)" /><path className="specimen-support" d="M120 223l18-31 18 31ZM382 223l18-31 18 31Z" /><DimensionLine x1={120} y1={245} x2={400} y2={245} label="S" /><DimensionLine x1={460} y1={115} x2={460} y2={182} label="W" vertical /><DimensionLine x1={287} y1={182} x2={287} y2={136} label="a₀" vertical /><text className="specimen-label" x="270" y="40">P</text><text className="specimen-note" x="300" y="112">B：板厚（紙面奥行）</text></svg>;

  if (kind === "tube") return <svg className="specimen-svg" viewBox="0 0 520 280" role="img" aria-label="薄肉管試験片の寸法記号図"><title>薄肉管試験片の寸法記号図</title>{defs}<path className="specimen-fill" d="M85 104H435V176H85Z" /><path className="specimen-inner" d="M85 126H435V154H85Z" /><path className="specimen-load" d="M75 140H30M445 140h45" markerStart="url(#figure-arrow)" markerEnd="url(#figure-arrow)" /><path className="specimen-torque" d="M150 90a28 28 0 1 1-26-1" markerEnd="url(#figure-arrow)" /><text className="specimen-label" x="50" y="128">F</text><text className="specimen-label" x="465" y="128">F</text><text className="specimen-label" x="158" y="81">T</text><DimensionLine x1={170} y1={210} x2={350} y2={210} label="Lᵍ" /><DimensionLine x1={464} y1={104} x2={464} y2={176} label="Dₒ" vertical /><DimensionLine x1={482} y1={126} x2={482} y2={154} label="Dᵢ" vertical /><text className="specimen-note" x="365" y="94">t = (Dₒ − Dᵢ) / 2</text></svg>;

  if (kind === "round") return <svg className="specimen-svg" viewBox="0 0 520 280" role="img" aria-label="回転曲げ用丸棒試験片の寸法記号図"><title>回転曲げ用丸棒試験片の寸法記号図</title>{defs}<path className="specimen-fill" d="M55 109H134Q148 109 156 121H364Q372 109 386 109H465V171H386Q372 171 364 159H156Q148 171 134 171H55Z" /><path className="specimen-rotation" d="M260 86a40 40 0 1 1-35 0" markerEnd="url(#figure-arrow)" /><text className="specimen-label" x="270" y="77">ω</text><DimensionLine x1={156} y1={212} x2={364} y2={212} label="Lᵍ" /><DimensionLine x1={406} y1={121} x2={406} y2={159} label="d" vertical /><text className="specimen-note" x="80" y="99">チャック側</text><text className="specimen-note" x="318" y="191">R：肩部半径</text></svg>;

  if (kind === "free-beam") return <svg className="specimen-svg" viewBox="0 0 520 280" role="img" aria-label="矩形梁試験片の寸法記号図"><title>矩形梁試験片の寸法記号図</title>{defs}<path className="specimen-fill" d="M70 118H450V172H70Z" /><path className="specimen-support" d="M110 222l18-38 18 38ZM382 222l18-38 18 38Z" /><path className="specimen-load" d="M260 52V104" markerEnd="url(#figure-arrow)" /><text className="specimen-label" x="270" y="48">加振／荷重</text><DimensionLine x1={70} y1={250} x2={450} y2={250} label="L" /><DimensionLine x1={472} y1={118} x2={472} y2={172} label="w" vertical /><text className="specimen-note" x="310" y="109">t：板厚（紙面奥行）</text><DimensionLine x1={128} y1={234} x2={400} y2={234} label="S" /></svg>;

  if (kind === "dma") return <svg className="specimen-svg" viewBox="0 0 520 280" role="img" aria-label="DMA短冊形試験片の寸法記号図"><title>DMA短冊形試験片の寸法記号図</title>{defs}<rect className="specimen-fill" x="105" y="113" width="310" height="54" /><path className="specimen-grip" d="M70 91v98M82 91v98M438 91v98M450 91v98" /><path className="specimen-load" d="M88 140H52M432 140h36" markerStart="url(#figure-arrow)" markerEnd="url(#figure-arrow)" /><DimensionLine x1={138} y1={215} x2={382} y2={215} label="Lᵍ" /><DimensionLine x1={443} y1={113} x2={443} y2={167} label="w" vertical /><text className="specimen-note" x="250" y="105">t：板厚（紙面奥行）</text><text className="specimen-label" x="58" y="128">F</text><text className="specimen-label" x="456" y="128">F</text></svg>;

  return <svg className="specimen-svg" viewBox="0 0 520 280" role="img" aria-label="一軸疲労試験片の寸法記号図"><title>一軸疲労試験片の寸法記号図</title>{defs}<path className="specimen-fill" d="M45 83H135V102Q135 112 153 112H367Q385 112 385 102V83H475V197H385V178Q385 168 367 168H153Q135 168 135 178V197H45Z" /><path className="specimen-grip" d="M60 93v94M82 93v94M438 93v94M460 93v94" /><path className="specimen-load" d="M85 140H28M435 140h57" markerStart="url(#figure-arrow)" markerEnd="url(#figure-arrow)" /><DimensionLine x1={153} y1={226} x2={367} y2={226} label="Lᵍ" /><DimensionLine x1={400} y1={112} x2={400} y2={168} label="w / d" vertical /><text className="specimen-note" x="207" y="102">t：板厚（平板）</text><text className="specimen-note" x="105" y="215">R：肩部半径</text><text className="specimen-label" x="37" y="128">F</text><text className="specimen-label" x="482" y="128">F</text></svg>;
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
