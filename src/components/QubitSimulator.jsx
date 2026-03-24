import { useMemo, useState } from "react";

function describe(probability) {
  if (probability <= 10) return "Mostly |0>";
  if (probability >= 90) return "Mostly |1>";
  if (probability >= 45 && probability <= 55) return "Balanced superposition";
  return probability < 50 ? "Leaning toward |0>" : "Leaning toward |1>";
}

export function QubitSimulator() {
  const [probability, setProbability] = useState(0);
  const [measurement, setMeasurement] = useState("|0>");
  const [copy, setCopy] = useState("Press Measure to collapse the current qubit state.");
  const [explanation, setExplanation] = useState({
    title: "Start at |0>",
    text: "The qubit begins in the simplest possible state, fully biased toward measuring 0.",
  });
  const [activeGate, setActiveGate] = useState("");

  const p1 = Math.round(probability);
  const p0 = 100 - p1;
  const caption = useMemo(() => describe(p1), [p1]);

  function applyGate(gate) {
    setActiveGate(gate);
    if (gate === "x") {
      setProbability((value) => 100 - value);
      setExplanation({
        title: "X flips the qubit",
        text: "This swaps the roles of 0 and 1, like a quantum version of a bit flip.",
      });
    }
    if (gate === "h") {
      setProbability(50);
      setExplanation({
        title: "H creates a balanced mix",
        text: "This is the intuitive superposition picture: both outcomes become plausible.",
      });
    }
    if (gate === "ry") {
      setProbability((value) => Math.min(100, Math.max(0, value + (50 - value) * 0.4 + 8)));
      setExplanation({
        title: "A small rotation nudges the state",
        text: "Parameterized gates are useful because they can change probabilities gradually instead of all at once.",
      });
    }
    if (gate === "measure") {
      const sample = Math.random() < p1 / 100 ? "|1>" : "|0>";
      setMeasurement(sample);
      setCopy(`This measurement returned ${sample}. Repeating the experiment can give a different result if the state is mixed.`);
      setExplanation({
        title: "Measurement gives a classical answer",
        text: "The quantum state itself is hidden. You only observe a sample drawn from its probabilities.",
      });
    }
    if (gate === "reset") {
      setProbability(0);
      setMeasurement("|0>");
      setCopy("Press Measure to collapse the current qubit state.");
      setExplanation({
        title: "Start at |0>",
        text: "The qubit begins in the simplest possible state, fully biased toward measuring 0.",
      });
    }
  }

  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <div className="mono-label">Interactive qubit simulator</div>
          <h3>Click gates and watch the state update.</h3>
        </div>
      </div>
      <div className="sim-grid">
        <div className="prob-ring" style={{ "--prob": p1 }}>
          <div className="ring-core">
            <div className="mono-label">P(1)</div>
            <div className="ring-value">{p1}%</div>
            <div className="ring-caption">{caption}</div>
          </div>
        </div>
        <div className="measurement-box">
          <div className="mono-label">Latest sample</div>
          <div className="measurement-chip">{measurement}</div>
          <p>{copy}</p>
          <div className="bars">
            <div className="bar-row">
              <span>|0&gt;</span>
              <div className="bar-track">
                <div className="bar-fill gold" style={{ width: `${p0}%` }} />
              </div>
            </div>
            <div className="bar-row">
              <span>|1&gt;</span>
              <div className="bar-track">
                <div className="bar-fill cyan" style={{ width: `${p1}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="gate-controls">
        {[
          ["x", "X flip"],
          ["h", "H mix"],
          ["ry", "Small rotation"],
          ["measure", "Measure"],
          ["reset", "Reset"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`chip-button${activeGate === key ? " active" : ""}`}
            onClick={() => applyGate(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="info-card accent">
        <strong>{explanation.title}</strong>
        {explanation.text}
      </div>
    </article>
  );
}
