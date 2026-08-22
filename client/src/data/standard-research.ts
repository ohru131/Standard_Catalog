/**
 * Style context: The catalogue remains a factual reference work. Research notes distinguish representative
 * interpretation equations from mandatory normative calculations and always retain a primary official source.
 */
export type ResearchReference = {
  label: string;
  url: string;
  note: string;
};

export type ResearchEquation = {
  label: string;
  latex: string;
  explanation: string;
};

export type StandardResearch = {
  interpretation: string;
  equations: ResearchEquation[];
  references: ResearchReference[];
};

type StandardInput = { id: string; category: string };

const fatigueReferences: ResearchReference[] = [
  { label: "NIST Fatigue and Fracture Group", url: "https://www.nist.gov/mml/acmd/fatigue-and-fracture-group", note: "疲労・破壊の試験・研究に関する公的研究機関の解説。" },
];

const categoryResearch: Record<string, Omit<StandardResearch, "interpretation"> & { interpretation: string }> = {
  "軸力制御": {
    interpretation: "S–Nデータは応力振幅だけでなく、応力比R、平均応力、表面状態、環境及び打切り条件を同じ記録単位で比較します。",
    equations: [
      { label: "応力比・応力振幅", latex: "R=\\frac{\\sigma_{\\min}}{\\sigma_{\\max}},\\qquad \\sigma_a=\\frac{\\sigma_{\\max}-\\sigma_{\\min}}{2}", explanation: "Rと応力振幅は、一定振幅疲労の負荷状態を識別する基本量です。" },
      { label: "Basquin型の整理例", latex: "\\sigma_a=\\sigma_f'(2N_f)^b", explanation: "弾性域の応力–寿命を対数軸で近似する代表式です。材料定数、回帰法及び適用域は報告で明示します。" },
    ],
    references: fatigueReferences,
  },
  "低サイクル": {
    interpretation: "ひずみ–寿命曲線では、全ひずみ範囲を弾性・塑性成分に分け、半寿命付近のヒステリシス応答と一緒に評価します。",
    equations: [
      { label: "Coffin–Manson–Basquin型の整理例", latex: "\\frac{\\Delta\\varepsilon}{2}=\\frac{\\sigma_f'}{E}(2N_f)^b+\\varepsilon_f'(2N_f)^c", explanation: "全ひずみ振幅を弾性項と塑性項で表す代表式です。寿命の定義と材料定数を併記します。" },
    ],
    references: fatigueReferences,
  },
  "変動振幅": {
    interpretation: "変動振幅下では負荷時系列の編集方法、サイクル計数法、平均応力・過負荷の取り扱いを、寿命結果と分離せずに残します。",
    equations: [
      { label: "線形累積損傷の整理例", latex: "D=\\sum_i\\frac{n_i}{N_i}", explanation: "Miner型の累積損傷指標です。荷重順序・過負荷効果を含む実際の損傷を保証する式ではありません。" },
    ],
    references: fatigueReferences,
  },
  "熱機械疲労": {
    interpretation: "温度と機械ひずみの位相、保持、熱ひずみの補正方法が、同じ全ひずみ範囲でも寿命を変えます。温度–ひずみ–応力の時間履歴を併記します。",
    equations: [
      { label: "全ひずみの概念的分解", latex: "\\varepsilon_{total}=\\varepsilon_{mech}+\\varepsilon_{th},\\qquad \\varepsilon_{th}=\\alpha\\Delta T", explanation: "機械ひずみと熱ひずみを区別するための概念式です。材料の線膨張係数と温度域に対する扱いは規格・試験計画に従います。" },
    ],
    references: [
      { label: "NASA Technical Reports Server：熱機械疲労寿命予測", url: "https://ntrs.nasa.gov/citations/19880005881", note: "熱機械疲労を扱う公開技術資料。" },
      ...fatigueReferences,
    ],
  },
  "回転曲げ": {
    interpretation: "回転曲げの応力–寿命比較では、荷重だけでなく平行部径、表面粗さ、偏心・振れ及び破断検知を試験条件として扱います。",
    equations: [
      { label: "円形断面の表面曲げ応力", latex: "\\sigma_a=\\frac{32M_a}{\\pi d^3}", explanation: "円形断面における公称表面応力の代表式です。実際の荷重系・断面形状に対応した規格の式を優先します。" },
    ],
    references: fatigueReferences,
  },
  "平面曲げ": {
    interpretation: "平面曲げでは、試験片断面・支点間距離・荷重点が公称応力の計算に直接入るため、治具図と荷重校正を残します。",
    equations: [
      { label: "矩形断面の曲げ応力（代表式）", latex: "\\sigma=\\frac{Mc}{I}", explanation: "曲げモーメントM、最外縁距離c、断面二次モーメントIによる基本関係です。規格の試験片形状に対応する算定式を用います。" },
    ],
    references: fatigueReferences,
  },
  "き裂進展": {
    interpretation: "da/dN–ΔK曲線は、近しきい値域・Paris領域・不安定化域を区別し、R、Kmax、環境、き裂長測定法及び荷重履歴と併せて解釈します。",
    equations: [
      { label: "応力拡大係数範囲", latex: "\\Delta K=K_{\\max}-K_{\\min}", explanation: "繰返し荷重に対する応力拡大係数の範囲です。幾何学関数は試験片形状ごとに規格の定義を使用します。" },
      { label: "Paris則", latex: "\\frac{da}{dN}=C(\\Delta K)^m", explanation: "中間的な安定き裂進展域を近似する代表式です。近しきい値域・不安定化域へ外挿しません。" },
    ],
    references: [
      { label: "ASTM E647-24", url: "https://store.astm.org/e0647-24.html", note: "疲労き裂進展速度測定の公式規格ページ。" },
      ...fatigueReferences,
    ],
  },
  "破壊靭性": {
    interpretation: "K、J、CTODの数値は、予き裂品質、試験片寸法、板厚・リガメント、荷重–変位又はCOD記録、き裂長測定及び規格の有効性判定を満たして初めて比較可能になります。",
    equations: [
      { label: "Mode I応力拡大係数の概念式", latex: "K_I=Y\\sigma\\sqrt{\\pi a}", explanation: "Yは試験片形状と荷重条件に依存する幾何学関数です。規格の幾何学関数と妥当性条件を使用します。" },
      { label: "エネルギー解放率との関係（線形弾性）", latex: "G_I=\\frac{K_I^2}{E'}", explanation: "E′は応力状態に依存する有効弾性率です。弾塑性域ではJ又はCTODの評価を用います。" },
    ],
    references: [
      { label: "ASTM E1820-25", url: "https://store.astm.org/e1820-25.html", note: "金属材料のK、J、CTOD及びR曲線評価の公式規格ページ。" },
      { label: "ISO 12135:2021", url: "https://www.iso.org/standard/78208.html", note: "均質金属の準静的破壊靭性評価に関する公式ページ。" },
    ],
  },
  "複合負荷": {
    interpretation: "複合負荷では、軸・ねじりの振幅、平均成分、位相差と負荷経路を、同じ試験片の局所ひずみ履歴として示します。",
    equations: [
      { label: "薄肉円管の公称せん断応力", latex: "\\tau=\\frac{T}{2\\pi r^2t}", explanation: "トルクT、平均半径r、肉厚tに基づく薄肉管の代表式です。実験の解析は規格で定めるひずみ計測・変換手順に従います。" },
    ],
    references: [
      { label: "ASTM E2207-15", url: "https://store.astm.org/e2207-15.html", note: "軸力–ねじりを組み合わせるひずみ制御疲労試験の公式規格ページ。" },
    ],
  },
  "動的粘弾性": {
    interpretation: "DMAの曲線は、変形モード、線形粘弾性域、振幅、周波数、昇温・降温速度、前処理・調湿がそろう条件で比較します。",
    equations: [
      { label: "複素弾性率", latex: "E^*=E'+iE''", explanation: "E′は貯蔵弾性率、E″は損失弾性率を表します。" },
      { label: "損失正接", latex: "\\tan\\delta=\\frac{E''}{E'}", explanation: "粘性成分と弾性成分の比を示す指標です。ピーク温度は試験条件とともに報告します。" },
    ],
    references: [
      { label: "TA Instruments：DMA introduction", url: "https://www.tainstruments.com/applications-notes/introduction-to-dynamic-mechanical-analysis-and-its-application-to-testing-of-polymer-solids/", note: "動的機械分析の公開技術解説。" },
    ],
  },
  "動的弾性率": {
    interpretation: "共振法は試験片の寸法・質量・密度・支持位置・振動モードが算出値の前提です。材料の均質性・異方性と原データの共振周波数を併記します。",
    equations: [
      { label: "共振周波数と剛性の関係（概念式）", latex: "f_n\\propto\\sqrt{\\frac{EI}{\\rho A L^4}}", explanation: "曲げ共振の概念的な比例関係です。ASTM E1876の形状・モード別計算式及び補正を優先します。" },
    ],
    references: [
      { label: "ASTM E1876-22", url: "https://store.astm.org/e1876-22.html", note: "共振周波数からの動的弾性率測定に関する公式規格ページ。" },
    ],
  },
  "制振・減衰": {
    interpretation: "損失係数は温度、周波数、振幅、層構成、接着条件、境界条件に依存します。単一のη値だけで用途適合性を結論づけません。",
    equations: [
      { label: "損失係数と損失正接", latex: "\\eta\\approx\\tan\\delta", explanation: "小減衰・線形粘弾性の近似関係です。測定法及び周波数・温度条件を併記します。" },
    ],
    references: [
      { label: "ASTM E756-05(2017)", url: "https://www.astm.org/e0756-05r17.html", note: "片持ち梁による減衰特性測定の公式規格ページ。" },
    ],
  },
  "試験系検証": {
    interpretation: "動的力の検証範囲は、実試験の荷重レンジ、波形、周波数、治具及び連結状態と対応させます。静的校正結果を動的精度の代替として扱いません。",
    equations: [
      { label: "相対振幅誤差の整理例", latex: "e_A=\\frac{A_{meas}-A_{cmd}}{A_{cmd}}\\times100\\%", explanation: "指令振幅と実測振幅の差を整理する代表式です。合否基準は適用規格・検証計画に従います。" },
    ],
    references: [
      { label: "ASTM E467-21", url: "https://store.astm.org/e0467-21.html", note: "軸疲労試験系における一定振幅動的力の検証に関する公式規格ページ。" },
    ],
  },
  "データ整理": {
    interpretation: "回帰式、確率線又は設計曲線を示す場合も、各点のR、温度、周波数、表面状態、破断・未破断を追跡できる形で原データとの対応を残します。",
    equations: [
      { label: "対数回帰の表記例", latex: "\\log N_f=A+B\\log\\sigma_a", explanation: "S–Nデータを対数軸で整理する代表的な直線回帰表現です。回帰範囲、打切りデータ及び統計方法を明記します。" },
    ],
    references: [
      { label: "ASTM E468/E468M-23a", url: "https://store.astm.org/e0468_e0468m-23a.html", note: "一定振幅疲労試験データの表示に関する公式規格ページ。" },
    ],
  },
};

const standardInterpretations: Record<string, string> = {
  "astm-e1921": "T0は単一の破壊靭性値ではなく、へき開破壊のKJcデータ集合を統計的に特徴付ける基準温度です。試験片の拘束、温度、K速度及び材料の均質性を母集団の前提として明示します。",
  "iso-15653": "溶接部では、疲労予き裂が溶接金属又はHAZの意図した領域をどの程度サンプリングしたかが、靭性値そのものと同程度に重要です。切欠き位置、マクロ組織及び破面の対応を残します。",
  "astm-c1421": "セラミックスでは、予き裂梁、表面き裂曲げ、シェブロンノッチ梁で、き裂寸法と破壊抵抗の意味が異なり得ます。方法名をKICの数値と必ず一緒に表示します。",
  "astm-d5045": "プラスチックのKIC・GICは、成形履歴、き裂方向、負荷速度、温度及び環境に依存します。板厚不足や荷重–変位の非線形があれば、有効な平面ひずみ値として扱いません。",
  "astm-d7791": "高分子では自己発熱と試験片剛性の変化で応力・ひずみ状態が変わり得ます。振幅・周波数と同時に、試験片温度・損傷観察を残します。",
  "astm-f2345": "医療用セラミック頭部の疲労評価は、コーン材、表面状態、組立条件及び環境液を含むシステム比較です。一般材料の一軸疲労データと直接同列に比較しません。",
};

export function getStandardResearch({ id, category }: StandardInput): StandardResearch {
  const fallback = categoryResearch["軸力制御"];
  const base = categoryResearch[category] ?? fallback;
  return { ...base, interpretation: standardInterpretations[id] ?? base.interpretation };
}
