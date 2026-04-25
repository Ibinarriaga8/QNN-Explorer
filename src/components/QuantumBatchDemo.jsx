// src/components/QuantumBatchDemo.jsx
import { useMemo, useState } from "react";
import {
  ALL_SAMPLES,
  labelForSample,
  predictExpectation,
  lossForSample,
  gradientForSample,
  createThetaMap,
  DEFAULT_THETAS,
  THETA_METADATA,
  randomThetaMap,
} from "../lib/qnnMath";
import { MathDisplay, MathInline } from "./MathText";

// ── Batch empirical risk: eq. 40 from the paper ──────────────────────────────
// For diagonal-in-data-basis unitaries:
//   batchRisk = 1 - (1/2)(⟨+1|U†Yu|+1⟩ - ⟨-1|U†Yu|-1⟩)
// Which equals the average sample loss over the whole dataset.
function batchRisk(thetas, task) {
  const pos = ALL_SAMPLES.filter((s) => labelForSample(s, task) > 0);
  const neg = ALL_SAMPLES.filter((s) => labelForSample(s, task) < 0);
  const avgPos = pos.reduce((sum, s) => sum + predictExpectation(s, thetas), 0) / pos.length;
  const avgNeg = neg.reduce((sum, s) => sum + predictExpectation(s, thetas), 0) / neg.length;
  return 1 - 0.5 * (avgPos - avgNeg);
}

// ── Batch gradient: average of per-sample gradients over each class ───────────
function batchGradient(thetas, task) {
  const result = Array(8).fill(0);
  ALL_SAMPLES.forEach((s) => {
    const g = gradientForSample(s, thetas, task);
    const sign = labelForSample(s, task) > 0 ? 1 : -1;
    g.forEach((v, i) => { result[i] += v * sign; });
  });
  return result.map((v) => v / ALL_SAMPLES.length);
}

// ── Simple animated training loop ─────────────────────────────────────────────
function useBatchTraining(task) {
  const [thetas, setThetas] = useState(() => randomThetaMap());
  const [history, setHistory] = useState([]);
  const [epoch, setEpoch] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = { current: null };

  function step(currentThetas) {
    const grad = batchGradient(currentThetas, task);
    const lr = 0.18;
    const next = Object.fromEntries(
      THETA_METADATA.map((m, i) => [m.id, currentThetas[m.id] - lr * grad[i]])
    );
    const risk = batchRisk(next, task);
    setThetas(next);
    setHistory((h) => [...h, risk].slice(-60));
    setEpoch((e) => e + 1);
    return next;
  }

  return { thetas, history, epoch, isRunning, setIsRunning, step, setThetas, setHistory, setEpoch };
}

// ── Superposition state visualizer ────────────────────────────────────────────
function SuperpositionViz({ task }) {
  const pos = ALL_SAMPLES.filter((s) => labelForSample(s, task) > 0);
  const neg = ALL_SAMPLES.filter((s) => labelForSample(s, task) < 0);

  return (
    <div className="batch-superposition-grid">
      <div className="batch-super-group">
        <div className="mono-label" style={{ color: "var(--teal)", marginBottom: "0.5rem" }}>
          |+1⟩ state — {pos.length} basis vectors
        </div>
        <div className="batch-ket-row">
          {pos.map((s) => (
            <span key={s} className="batch-ket batch-ket-pos">{s}</span>
          ))}
        </div>
        <div className="info-card" style={{ marginTop: "0.7rem", padding: "0.7rem 0.9rem" }}>
          <MathInline math={`|+1\\rangle = \\frac{1}{\\sqrt{${pos.length}}}\\sum_{z:\\,l(z)=+1}|z,1\\rangle`} />
        </div>
      </div>
      <div className="batch-super-group">
        <div className="mono-label" style={{ color: "var(--rose)", marginBottom: "0.5rem" }}>
          |−1⟩ state — {neg.length} basis vectors
        </div>
        <div className="batch-ket-row">
          {neg.map((s) => (
            <span key={s} className="batch-ket batch-ket-neg">{s}</span>
          ))}
        </div>
        <div className="info-card" style={{ marginTop: "0.7rem", padding: "0.7rem 0.9rem" }}>
          <MathInline math={`|-1\\rangle = \\frac{1}{\\sqrt{${neg.length}}}\\sum_{z:\\,l(z)=-1}|z,1\\rangle`} />
        </div>
      </div>
    </div>
  );
}

// ── Per-sample loss strip ──────────────────────────────────────────────────────
function SampleLossStrip({ thetas, task }) {
  const samples = ALL_SAMPLES.map((s) => ({
    s,
    label: labelForSample(s, task),
    pred: predictExpectation(s, thetas),
    loss: lossForSample(s, thetas, task),
  }));
  const correct = samples.filter((d) => d.pred * d.label > 0).length;

  return (
    <div className="batch-strip-wrapper">
      <div className="mono-label" style={{ marginBottom: "0.5rem" }}>
        Per-sample loss — {correct}/{ALL_SAMPLES.length} correct
      </div>
      <div className="batch-sample-strip">
        {samples.map(({ s, label, loss }) => (
          <div
            key={s}
            className="batch-sample-cell"
            title={`${s} → label ${label > 0 ? "+1" : "-1"}, loss ${loss.toFixed(2)}`}
            style={{
              background: `rgba(${label > 0 ? "109,224,187" : "255,149,166"},${Math.max(0.08, 1 - loss)})`,
              borderColor: label > 0 ? "rgba(109,224,187,0.4)" : "rgba(255,149,166,0.4)",
            }}
          >
            <span className="batch-cell-label">{s}</span>
            <span className="batch-cell-loss">{loss.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Loss history sparkline ─────────────────────────────────────────────────────
function LossSparkline({ history, label, color }) {
  if (history.length < 2) {
    return (
      <div className="batch-sparkline-empty">
        <span style={{ color: "var(--muted)", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.8rem" }}>
          {label} — run training to see curve
        </span>
      </div>
    );
  }
  const max = Math.max(...history, 1);
  const W = 320, H = 80, PAD = 8;
  const pts = history
    .map((v, i) => {
      const x = PAD + (i / (history.length - 1)) * (W - 2 * PAD);
      const y = H - PAD - ((v / max) * (H - 2 * PAD));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="batch-sparkline">
      <div className="mono-label" style={{ marginBottom: "0.4rem" }}>{label}</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} rx="12" fill="#081421" />
        <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke="rgba(255,255,255,0.07)" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function QuantumBatchDemo() {
  const [task, setTask] = useState("majority");
  const [view, setView] = useState("superposition");

  // Two independent training states: batch vs sequential
  const [batchThetas, setBatchThetas] = useState(() => randomThetaMap());
  const [batchHistory, setBatchHistory] = useState([]);
  const [batchEpoch, setBatchEpoch] = useState(0);

  const [seqThetas, setSeqThetas] = useState(() => ({ ...batchThetas })); // same seed
  const [seqHistory, setSeqHistory] = useState([]);
  const [seqEpoch, setSeqEpoch] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useMemo(() => ({ current: null }), []);

  const currentBatchRisk = useMemo(() => batchRisk(batchThetas, task), [batchThetas, task]);
  const currentSeqRisk = useMemo(() => batchRisk(seqThetas, task), [seqThetas, task]);

  function runOneStep(bt, st) {
    // Batch: gradient over all samples at once
    const bg = batchGradient(bt, task);
    const lr = 0.18;
    const nextBatch = Object.fromEntries(
      THETA_METADATA.map((m, i) => [m.id, bt[m.id] - lr * bg[i]])
    );

    // Sequential: gradient on a single random sample
    const sample = ALL_SAMPLES[Math.floor(Math.random() * ALL_SAMPLES.length)];
    const sg = gradientForSample(sample, st, task);
    const nextSeq = Object.fromEntries(
      THETA_METADATA.map((m, i) => [m.id, st[m.id] - lr * sg[i]])
    );

    setBatchThetas(nextBatch);
    setBatchHistory((h) => [...h, batchRisk(nextBatch, task)].slice(-60));
    setBatchEpoch((e) => e + 1);

    setSeqThetas(nextSeq);
    setSeqHistory((h) => [...h, batchRisk(nextSeq, task)].slice(-60));
    setSeqEpoch((e) => e + 1);

    return { nextBatch, nextSeq };
  }

  function toggleTraining() {
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
      let bt = batchThetas;
      let st = seqThetas;
      timerRef.current = setInterval(() => {
        const { nextBatch, nextSeq } = runOneStep(bt, st);
        bt = nextBatch;
        st = nextSeq;
      }, 120);
    }
  }

  function reset() {
    clearInterval(timerRef.current);
    setIsRunning(false);
    const fresh = randomThetaMap();
    setBatchThetas(fresh);
    setSeqThetas({ ...fresh });
    setBatchHistory([]);
    setSeqHistory([]);
    setBatchEpoch(0);
    setSeqEpoch(0);
  }

  return (
    <div className="quantum-batch-demo">
      {/* ── Controls ── */}
      <div className="circuit-toolbar">
        <div className="task-toggle" style={{ margin: 0 }}>
          {["majority", "parity"].map((t) => (
            <button
              key={t}
              className={task === t ? "active" : ""}
              onClick={() => { reset(); setTask(t); }}
              type="button"
            >
              {t === "majority" ? "Majority task" : "Parity task"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.7rem" }}>
          <button className="button" onClick={toggleTraining} type="button">
            {isRunning ? "Pause" : "Run comparison"}
          </button>
          <button className="button secondary" onClick={reset} type="button">Reset</button>
        </div>
      </div>

      {/* ── Tab selector ── */}
      <div className="circuit-step-strip">
        {[
          { id: "superposition", label: "Superposition states" },
          { id: "risk", label: "Empirical risk" },
          { id: "compare", label: "Batch vs sequential" },
          { id: "samples", label: "Per-sample losses" },
        ].map(({ id, label }) => (
          <button
            key={id}
            className={`step-chip${view === id ? " active" : ""}`}
            onClick={() => setView(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Superposition view ── */}
      {view === "superposition" ? (
        <div className="stack">
          <div className="info-card accent">
            <strong>The quantum batch idea (paper Section 3.4)</strong>
            <p>
              Instead of presenting one sample at a time, form a uniform superposition of all
              samples sharing the same label. One quantum state encodes the entire class.
            </p>
            <MathDisplay math={"N_+ = \\frac{1}{\\sqrt{|\\{z:l(z)=+1\\}|}}"} />
            <p>
              When the unitary U(θ) is diagonal in the data-qubit computational basis (as
              the ZX gates are), cross terms vanish and the expectation value over |+1⟩
              equals the average predicted label across all +1 samples.
            </p>
          </div>
          <SuperpositionViz task={task} />
        </div>
      ) : null}

      {/* ── Empirical risk view ── */}
      {view === "risk" ? (
        <div className="stack">
          <div className="info-card accent">
            <strong>Empirical risk as a single measurement (paper eq. 40)</strong>
            <MathDisplay
              math={
                "\\mathcal{R}(\\theta) = 1 - \\frac{1}{2}\\Bigl(" +
                "\\langle +1|U^\\dagger(\\theta)Y_r U(\\theta)|+1\\rangle" +
                " - \\langle -1|U^\\dagger(\\theta)Y_r U(\\theta)|-1\\rangle\\Bigr)"
              }
            />
            <p>
              The difference in readout expectation between the two superposition states is
              the empirical risk over the entire dataset — computed in one shot. In the demo
              this matches the average sample loss exactly.
            </p>
          </div>
          <div className="grid-2">
            <div className="info-card">
              <strong>Batch risk (eq. 40)</strong>
              <div className="metric-box" style={{ marginTop: "0.7rem" }}>
                <div className="lbl">Current value</div>
                <div className="val">{currentBatchRisk.toFixed(4)}</div>
              </div>
              <p style={{ marginTop: "0.7rem" }}>
                Range: 0 = perfect, 1 = random guessing, 2 = worst possible.
                The paper reports this settling around 0.5 in their experiments — not
                zero, but low enough for good categorical accuracy.
              </p>
            </div>
            <div className="info-card">
              <strong>Why phases don't matter here</strong>
              <p>
                The paper notes that the phases ϕ_z in the superposition states are
                irrelevant when U(θ) is diagonal in the data-qubit basis — cross terms
                between different basis states cancel. In their experiments they set all
                phases to 0.
              </p>
              <MathDisplay
                math={
                  "\\langle +1|U^\\dagger Y_r U|+1\\rangle = " +
                  "\\frac{1}{|S_+|}\\sum_{z\\in S_+} \\hat{y}(z;\\theta)"
                }
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Comparison view ── */}
      {view === "compare" ? (
        <div className="stack">
          <div className="grid-2">
            <div className="info-card accent">
              <strong>Quantum batch training</strong>
              <p>
                Gradient is computed over the full dataset at each step via the two
                superposition states. The paper reports the empirical risk "smoothly
                decreases until it settles at a local minimum."
              </p>
              <div className="metric-box" style={{ marginTop: "0.75rem" }}>
                <div className="lbl">Epoch {batchEpoch} — risk</div>
                <div className="val">{currentBatchRisk.toFixed(4)}</div>
              </div>
              <LossSparkline history={batchHistory} label="Batch risk" color="var(--teal)" />
            </div>
            <div className="info-card">
              <strong>Sequential (stochastic) training</strong>
              <p>
                One random sample per step. The loss "fluctuates seemingly randomly until
                it trends down on average" (paper Section 3.4). Same starting parameters,
                same learning rate.
              </p>
              <div className="metric-box" style={{ marginTop: "0.75rem" }}>
                <div className="lbl">Epoch {seqEpoch} — risk</div>
                <div className="val">{currentSeqRisk.toFixed(4)}</div>
              </div>
              <LossSparkline history={seqHistory} label="Sequential risk" color="var(--rose)" />
            </div>
          </div>
          <div className="info-card">
            <strong>The paper's claim</strong>
            <p>
              "We saw more than an order of magnitude improvement in the sample complexity
              required to get comparable (or better) generalization error on individual test
              samples." The batch approach benefits from a smoother objective — gradient
              descent has less noise to fight.
            </p>
          </div>
        </div>
      ) : null}

      {/* ── Per-sample view ── */}
      {view === "samples" ? (
        <div className="stack">
          <div className="info-card accent">
            <strong>Per-sample breakdown — batch parameters</strong>
            <p>
              Each cell is one 4-bit string. Green = +1 labeled, red = −1 labeled. Darker
              = lower loss. You can watch these converge as training runs on the comparison
              tab.
            </p>
          </div>
          <SampleLossStrip thetas={batchThetas} task={task} />
          <SampleLossStrip thetas={seqThetas} task={task} />
        </div>
      ) : null}
    </div>
  );
}
