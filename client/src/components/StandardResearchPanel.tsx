/**
 * Style context: Quiet technical catalogue. Equations, specimen geometry, and sources are arranged as a
 * traceable reading layer after the normative test brief—not as decorative content.
 */
import { BookOpen, ExternalLink } from "lucide-react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getStandardResearch } from "@/data/standard-research";
import { getSpecimenFigure, SpecimenDiagram } from "@/components/SpecimenDiagram";

type StandardResearchPanelProps = {
  id: string;
  category: string;
  source: string;
  sourceLabel: string;
};

export function StandardResearchPanel({ id, category, source, sourceLabel }: StandardResearchPanelProps) {
  const research = getStandardResearch({ id, category });
  const specimenFigure = getSpecimenFigure({ id, category });
  const references = Array.from(new Map([
    { label: sourceLabel, url: source, note: "本目録の公式規格ページ。版、適用範囲及び購入・閲覧先を確認します。" },
    ...research.references,
  ].map((reference) => [reference.url, reference])).values());

  return <>
    <section className="technical-reading" aria-labelledby="technical-reading-title">
      <div className="technical-reading-heading"><div><p className="eyebrow">RESULT INTERPRETATION</p><h3 id="technical-reading-title">結果の読み解き・代表式</h3></div><span>LaTeX</span></div>
      <p className="technical-reading-summary">{research.interpretation}</p>
      <div className="equation-list">
        {research.equations.map((equation) => <article className="equation-card" key={equation.label}>
          <h4>{equation.label}</h4>
          <div className="equation-math"><BlockMath math={equation.latex} /></div>
          <p>{equation.explanation}</p>
        </article>)}
      </div>
      <p className="equation-note">代表式は結果の意味を読むための補助です。試験片固有の幾何学関数、係数、単位、有効性条件及び計算法は、必ず適用する最新版の規格本文を優先してください。</p>
    </section>
    {specimenFigure && <SpecimenDiagram figure={specimenFigure} sourceUrl={source} sourceLabel={sourceLabel} />}
    <section className="reference-list" aria-labelledby="reference-list-title">
      <div className="reference-list-heading"><div><p className="eyebrow">REFERENCES</p><h3 id="reference-list-title">参考文献・情報参照元</h3></div><BookOpen size={18} aria-hidden="true" /></div>
      <ol>
        {references.map((reference, index) => <li key={reference.url}>
          <span className="reference-number">{String(index + 1).padStart(2, "0")}</span>
          <div><a href={reference.url} target="_blank" rel="noreferrer">{reference.label}<ExternalLink size={14} aria-hidden="true" /></a><p>{reference.note}</p></div>
        </li>)}
      </ol>
    </section>
  </>;
}
