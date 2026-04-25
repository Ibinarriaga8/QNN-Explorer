import { BlockMath, InlineMath } from "react-katex";

export function MathInline({ math }) {
  return (
    <span className="math-inline">
      <InlineMath math={math} />
    </span>
  );
}

export function MathDisplay({ math }) {
  return (
    <div className="math-display">
      <BlockMath math={math} />
    </div>
  );
}
