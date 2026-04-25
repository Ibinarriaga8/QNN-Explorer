// src/components/ReedMullerExplorer.jsx
import { useState } from "react";
import { MathDisplay, MathInline } from "./MathText";

const FUNCTIONS = {
  parity: {
    name: "3-bit Parity",
    formulaLatex: "b_1 \\oplus b_2 \\oplus b_3",
    description: "Label is 1 when an odd number of bits are 1. Every bit contributes independently.",
    eval: ([b1, b2, b3]) => (b1 + b2 + b3) % 2,
    rmTerms: [
      { latex: "b_1", bits: [0], degree: 1 },
      { latex: "b_2", bits: [1], degree: 1 },
      { latex: "b_3", bits: [2], degree: 1 },
    ],
    insight:
      "3 linear terms → 3 ZX-type gates. Learnable at small n, but the paper (eq. 35) shows the empirical risk is exponentially flat at large n, so gradient descent loses signal.",
  },
  majority: {
    name: "3-bit Majority",
    formulaLatex: "b_1 b_2 \\oplus b_1 b_3 \\oplus b_2 b_3",
    description: "Label is 1 when 2 or more bits are 1. Each RM term is a degree-2 AND.",
    eval: ([b1, b2, b3]) => (b1 + b2 + b3 >= 2 ? 1 : 0),
    rmTerms: [
      { latex: "b_1 b_2", bits: [0, 1], degree: 2 },
      { latex: "b_1 b_3", bits: [0, 2], degree: 2 },
      { latex: "b_2 b_3", bits: [1, 2], degree: 2 },
    ],
    insight:
      "3 quadratic terms. Each degree-2 term becomes a doubly-controlled rotation — still polynomial depth. The paper shows majority trains well because it is linearly separable (Section 3.2).",
  },
  and3: {
    name: "3-bit AND",
    formulaLatex: "b_1 b_2 b_3",
    description: "Label is 1 only when all three bits are 1. A single cubic term.",
    eval: ([b1, b2, b3]) => b1 & b2 & b3,
    rmTerms: [{ latex: "b_1 b_2 b_3", bits: [0, 1, 2], degree: 3 }],
    insight:
      "One degree-3 term → one triply-controlled rotation. The paper cites Barenco et al. (ref. [11]): a k-controlled unitary costs O(n²) two-qubit gates, so this is still tractable.",
  },
  or3: {
    name: "3-bit OR",
    formulaLatex:
      "b_1 \\oplus b_2 \\oplus b_3 \\oplus b_1 b_2 \\oplus b_1 b_3 \\oplus b_2 b_3 \\oplus b_1 b_2 b_3",
    description:
      "Label is 1 when any bit is 1. Requires all 7 non-trivial RM terms — the worst case for n=3.",
    eval: ([b1, b2, b3]) => b1 | b2 | b3,
    rmTerms: [
      { latex: "b_1", bits: [0], degree: 1 },
      { latex: "b_2", bits: [1], degree: 1 },
      { latex: "b_3", bits: [2], degree: 1 },
      { latex: "b_1 b_2", bits: [0, 1], degree: 2 },
      { latex: "b_1 b_3", bits: [0, 2], degree: 2 },
      { latex: "b_2 b_3", bits: [1, 2], degree: 2 },
      { latex: "b_1 b_2 b_3", bits: [0, 1, 2], degree: 3 },
    ],
    insight:
      "For n-bit OR, the RM expansion has 2ⁿ−1 terms → exponential circuit depth. This is the paper's example of a function that is representable in principle but needs an exponentially long circuit.",
  },
};

const ALL_3BIT = Array.from({ length: 8 }, (_, i) => [(i >> 2) & 1, (i >> 1) & 1, i & 1]);

const DEGREE_STYLE = {
  1: { color: "var(--cyan)", label: "linear" },
  2: { color: "var(--gold)", label: "quadratic" },
  3: { color: "var(--rose)", label: "cubic" },
};

export function ReedMullerExplorer() {
  const [selected, setSelected] = useState("parity");
  const [hoveredTerm, setHoveredTerm] = useState(null);
  const fn = FUNCTIONS[selected];

  const highlightedRows =
    hoveredTerm !== null
      ? new Set(
          ALL_3BIT.filter((bits) =>
            fn.rmTerms[hoveredTerm].bits.every((i) => bits[i] === 1)
          ).map((bits) => bits.join(""))
        )
      : new Set();

  return (
    <div className="rm-explorer">
      <div className="rm-selector">
        {Object.entries(FUNCTIONS).map(([key, f]) => (
          <button
            key={key}
            className={`chip-button${selected === key ? " active" : ""}`}
            onClick={() => {
              setSelected(key);
              setHoveredTerm(null);
            }}
            type="button"
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="rm-main-grid">
        {/* ── Truth Table ── */}
        <div className="info-card">
          <strong>Truth table</strong>
          <p>{fn.description}</p>
          <div className="rm-truth-table">
            <div className="rm-table-header">
              {["b₁", "b₂", "b₃", "f"].map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>
            {ALL_3BIT.map((bits) => {
              const rowKey = bits.join("");
              const val = fn.eval(bits);
              return (
                <div
                  key={rowKey}
                  className={[
                    "rm-table-row",
                    val ? "rm-pos" : "rm-neg",
                    highlightedRows.has(rowKey) ? "rm-lit" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {bits.map((b, i) => (
                    <span key={i}>{b}</span>
                  ))}
                  <span className={val ? "rm-val-pos" : "rm-val-neg"}>{val}</span>
                </div>
              );
            })}
          </div>
          <p className="rm-hover-hint">Hover a term on the right to highlight activated rows</p>
        </div>

        {/* ── RM Expansion ── */}
        <div className="info-card accent">
          <strong>Reed-Muller expansion</strong>
          <p>
            Every Boolean function has a unique XOR-of-AND expansion. Each term maps to one
            controlled rotation on the readout qubit (paper eqs. 9–13).
          </p>
          <MathDisplay math={`f(b) = ${fn.formulaLatex}`} />
          <div className="rm-term-list">
            {fn.rmTerms.map((term, i) => {
              const style = DEGREE_STYLE[term.degree];
              return (
                <div
                  key={i}
                  className={`rm-term-row${hoveredTerm === i ? " rm-term-active" : ""}`}
                  style={{ "--rm-color": style.color }}
                  onMouseEnter={() => setHoveredTerm(i)}
                  onMouseLeave={() => setHoveredTerm(null)}
                >
                  <span className="rm-term-expr">
                    <MathInline math={term.latex} />
                  </span>
                  <span className="rm-term-badge">{style.label}</span>
                  <span className="rm-term-arrow">→</span>
                  <span className="rm-term-gate">
                    e^{"{−iπ/2 · "}
                    B
                    {term.bits.map((b) => b + 1).join("")}
                    {" · Xᵣ}"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Circuit Cost ── */}
        <div className="info-card">
          <strong>Circuit cost</strong>
          <div className="rm-metrics-row">
            <div className="metric-box">
              <div className="lbl">RM terms</div>
              <div className="val">{fn.rmTerms.length}</div>
            </div>
            <div className="metric-box">
              <div className="lbl">Max degree</div>
              <div className="val">{Math.max(...fn.rmTerms.map((t) => t.degree))}</div>
            </div>
          </div>

          <div className="mono-label" style={{ margin: "1rem 0 0.5rem" }}>
            Gate sequence on readout qubit
          </div>
          <div className="rm-gate-row">
            {fn.rmTerms.map((term, i) => {
              const style = DEGREE_STYLE[term.degree];
              return (
                <div
                  key={i}
                  className={`rm-gate-block${hoveredTerm === i ? " rm-gate-lit" : ""}`}
                  style={{ "--rm-color": style.color }}
                  onMouseEnter={() => setHoveredTerm(i)}
                  onMouseLeave={() => setHoveredTerm(null)}
                >
                  <span className="rm-gate-top">B{term.bits.map((b) => b + 1).join("")}</span>
                  <span className="rm-gate-bot">Xᵣ</span>
                </div>
              );
            })}
            <div className="rm-gate-measure">⟨Yᵣ⟩</div>
          </div>

          <div className="rm-depth-bar">
            <span className="rm-depth-label">
              {fn.rmTerms.length} of 7 possible n=3 terms
            </span>
            <div className="rm-depth-track">
              <div
                className="rm-depth-fill"
                style={{ width: `${(fn.rmTerms.length / 7) * 100}%` }}
              />
            </div>
          </div>

          <div className="info-card" style={{ marginTop: "0.9rem" }}>
            <strong>Key insight</strong>
            <p>{fn.insight}</p>
          </div>
        </div>
      </div>

      <div className="info-card accent" style={{ marginTop: "1rem" }}>
        <strong>The general representation formula (paper Section 2)</strong>
        <MathDisplay
          math={
            "U_l = e^{i\\frac{\\pi}{4}X_r}" +
            "\\prod_{S:\\,a_S=1} e^{-i\\frac{\\pi}{2}B_S X_r}"
          }
        />
        <p>
          Any Boolean label function can be expressed this way, giving zero sample loss.
          But some functions need 2ⁿ terms — exponential circuit depth. This is the quantum
          analog of the classical representation theorem: any function fits a depth-3 network,
          but the inner layer may need 2ⁿ neurons.
        </p>
      </div>
    </div>
  );
}
