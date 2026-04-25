// src/components/QuantumStateLabelingDemo.jsx
import { useMemo, useState } from "react";
import { MathDisplay, MathInline } from "./MathText";

// ── Ising-type Hamiltonian on 4 qubits ────────────────────────────────────────
// H = Σ_{<ij>} J_ij Z_i Z_j   (paper eq. 46, adapted to 4 qubits)
// Edges: (0,1), (1,2), (2,3), (0,2), (1,3)  — a 4-node graph
const EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 2],
  [1, 3],
];

// Fixed random couplings J_ij ∈ {+1, -1} — seeded for reproducibility
const COUPLINGS = [1, -1, 1, -1, 1];

// Compute ⟨ψ|H|ψ⟩ for a product state ψ defined by angles θ_i:
//   |ψ⟩ = ⊗_i R_y(α_i)|+x⟩   (paper Section 3.5)
//   Z_i expectation = -sin(α_i)  (since |+x⟩ has ⟨Z⟩=0, rotation about Y by α gives ⟨Z⟩=-sinα)
function hamiltonianExpectation(angles) {
  const zExps = angles.map((a) => -Math.sin(a));
  return EDGES.reduce((sum, [i, j], k) => sum + COUPLINGS[k] * zExps[i] * zExps[j], 0);
}

function trueLabel(angles) {
  return hamiltonianExpectation(angles) >= 0 ? 1 : -1;
}

// ── QNN prediction for quantum state labels ────────────────────────────────────
// We use the paper's circuit: U(θ) = exp(i Σ_{<ij>} θ_ij Z_i Z_j X_r)
// ⟨ψ,1|U†Y_r U|ψ,1⟩ = ⟨ψ|sin(2 Σ θ_ij Z_i Z_j)|ψ⟩
// For small β this ≈ 2β⟨ψ|H|ψ⟩ (paper eq. 44-45)
function qnnPrediction(angles, thetas) {
  const zExps = angles.map((a) => -Math.sin(a));
  const weightedSum = EDGES.reduce(
    (sum, [i, j], k) => sum + thetas[k] * zExps[i] * zExps[j],
    0
  );
  return Math.sin(2 * weightedSum);
}

function predictionLabel(angles, thetas) {
  return qnnPrediction(angles, thetas) >= 0 ? 1 : -1;
}

// ── Generate random product state (random angles) ─────────────────────────────
function randomAngles() {
  return Array.from({ length: 4 }, () => (Math.random() - 0.5) * Math.PI * 2);
}

// ── Small gradient update (finite difference for simplicity) ──────────────────
function gradientStep(trainingSet, thetas, lr = 0.12) {
  const grad = Array(EDGES.length).fill(0);
  trainingSet.forEach(({ angles, label }) => {
    EDGES.forEach((_, k) => {
      const eps = 0.03;
      const up = [...thetas]; up[k] += eps;
      const down = [...thetas]; down[k] -= eps;
      const dLoss = (
        (1 - label * qnnPrediction(angles, up)) -
        (1 - label * qnnPrediction(angles, down))
      ) / (2 * eps);
      grad[k] += dLoss;
    });
  });
  return thetas.map((t, k) => t - lr * (grad[k] / trainingSet.length));
}

// ── Compute accuracy on a set ─────────────────────────────────────────────────
function computeAccuracy(dataSet, thetas) {
  const correct = dataSet.filter(
    ({ angles, label }) => predictionLabel(angles, thetas) === label
  ).length;
  return correct / dataSet.length;
}

// ── Hamiltonian edge diagram ───────────────────────────────────────────────────
function HamiltonianDiagram({ angles, thetas }) {
  const zExps = angles.map((a) => -Math.sin(a));
  const W = 280, H = 200;
  const positions = [
    [60, 55],   // q0
    [220, 55],  // q1
    [220, 145], // q2
    [60, 145],  // q3
  ];

  const hExp = hamiltonianExpectation(angles);
  const pred = qnnPrediction(angles, thetas);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }} role="img" aria-label="Hamiltonian graph">
      <rect width={W} height={H} rx="18" fill="#081421" />
      {EDGES.map(([i, j], k) => {
        const [x1, y1] = positions[i];
        const [x2, y2] = positions[j];
        const J = COUPLINGS[k];
        return (
          <line key={k} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={J > 0 ? "rgba(120,233,255,0.7)" : "rgba(255,149,166,0.7)"}
            strokeWidth="3" strokeDasharray={J > 0 ? undefined : "6 4"} />
        );
      })}
      {positions.map(([x, y], i) => {
        const z = zExps[i];
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="20"
              fill={z > 0 ? "rgba(109,224,187,0.15)" : "rgba(255,211,107,0.15)"}
              stroke={z > 0 ? "#6de0bb" : "#ffd36b"} strokeWidth="2" />
            <text x={x} y={y - 26} textAnchor="middle"
              fill="rgba(155,176,197,0.8)" fontFamily="IBM Plex Mono, monospace" fontSize="10">
              ⟨Z{i}⟩={z.toFixed(2)}
            </text>
            <text x={x} y={y + 5} textAnchor="middle" fill="var(--text)"
              fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="700">q{i}</text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 12} textAnchor="middle"
        fill={hExp >= 0 ? "rgba(109,224,187,0.9)" : "rgba(255,149,166,0.9)"}
        fontFamily="IBM Plex Mono, monospace" fontSize="11">
        ⟨H⟩ = {hExp.toFixed(3)} → label {hExp >= 0 ? "+1" : "-1"}
      </text>
      <text x={W - 10} y={H - 12} textAnchor="end"
        fill={pred * hExp >= 0 ? "rgba(120,233,255,0.85)" : "rgba(255,149,166,0.85)"}
        fontFamily="IBM Plex Mono, monospace" fontSize="11">
        QNN: {pred >= 0 ? "+1" : "-1"} {pred * hExp >= 0 ? "✓" : "✗"}
      </text>
    </svg>
  );
}

export function QuantumStateLabelingDemo() {
  const [thetas, setThetas] = useState(() => EDGES.map(() => 0.05));
  const [probeAngles, setProbeAngles] = useState(() => randomAngles());
  const [trainingSet] = useState(() =>
    Array.from({ length: 40 }, () => {
      const angles = randomAngles();
      return { angles, label: trueLabel(angles) };
    })
  );
  const [testSet] = useState(() =>
    Array.from({ length: 40 }, () => {
      const angles = randomAngles();
      return { angles, label: trueLabel(angles) };
    })
  );
  const [history, setHistory] = useState([]);
  const [epoch, setEpoch] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useMemo(() => ({ current: null }), []);

  const trainAcc = useMemo(() => computeAccuracy(trainingSet, thetas), [trainingSet, thetas]);
  const testAcc = useMemo(() => computeAccuracy(testSet, thetas), [testSet, thetas]);
  const hExp = hamiltonianExpectation(probeAngles);
  const pred = qnnPrediction(probeAngles, thetas);
  const isCorrect = pred * hExp >= 0;

  function toggleTraining() {
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
      let t = thetas;
      timerRef.current = setInterval(() => {
        t = gradientStep(trainingSet, t);
        const tAcc = computeAccuracy(trainingSet, t);
        const vAcc = computeAccuracy(testSet, t);
        setThetas([...t]);
        setHistory((h) => [...h, { train: tAcc, test: vAcc }].slice(-60));
        setEpoch((e) => e + 1);
      }, 90);
    }
  }

  function reset() {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setThetas(EDGES.map(() => 0.05));
    setHistory([]);
    setEpoch(0);
  }

  const W = 400, H = 100;
  const sparkPts = (key) =>
    history.length < 2
      ? ""
      : history
          .map((v, i) => {
            const x = 12 + (i / (history.length - 1)) * (W - 24);
            const y = H - 12 - v[key] * (H - 24);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ");

  return (
    <div className="qsl-demo">
      {/* ── The Hamiltonian ── */}
      <div className="info-card accent">
        <strong>The Hamiltonian label function (paper Section 3.5, eq. 46)</strong>
        <MathDisplay math={"H = \\sum_{\\langle ij\\rangle} J_{ij}\\, Z_i Z_j"} />
        <p>
          Each quantum state |ψ⟩ receives label +1 if ⟨ψ|H|ψ⟩ ≥ 0 and −1 otherwise.
          This is a label that has no classical analog when |ψ⟩ has no compact classical
          description — no classical neural network can accept |ψ⟩ directly as input.
        </p>
        <div className="qsl-coupling-row">
          {EDGES.map(([i, j], k) => (
            <span key={k} className={`qsl-coupling ${COUPLINGS[k] > 0 ? "pos" : "neg"}`}>
              J_{i}{j} = {COUPLINGS[k] > 0 ? "+1" : "−1"}
            </span>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: "1rem" }}>
        {/* ── Probe state panel ── */}
        <div className="info-card">
          <strong>Probe state — click to randomize</strong>
          <p style={{ marginBottom: "0.7rem" }}>
            Each data qubit is rotated about Y by a random angle, forming a product state.
            The QNN tries to predict the sign of ⟨H⟩.
          </p>
          <HamiltonianDiagram angles={probeAngles} thetas={thetas} />
          <div className="qsl-angle-grid">
            {probeAngles.map((a, i) => (
              <div key={i} className="metric-box">
                <div className="lbl">α{i}</div>
                <div className="val">{a.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <button
            className="button secondary"
            style={{ marginTop: "0.9rem", width: "100%" }}
            onClick={() => setProbeAngles(randomAngles())}
            type="button"
          >
            New random state
          </button>
          <div
            className="info-card"
            style={{
              marginTop: "0.8rem",
              borderColor: isCorrect ? "rgba(109,224,187,0.4)" : "rgba(255,149,166,0.4)",
              background: isCorrect
                ? "rgba(109,224,187,0.07)"
                : "rgba(255,149,166,0.07)",
            }}
          >
            <strong style={{ color: isCorrect ? "var(--teal)" : "var(--rose)" }}>
              {isCorrect ? "✓ Correct prediction" : "✗ Wrong prediction"}
            </strong>
            <p>
              True label: {hExp >= 0 ? "+1" : "−1"} (⟨H⟩ = {hExp.toFixed(3)})<br />
              QNN output: {pred.toFixed(3)} → {pred >= 0 ? "+1" : "−1"}
            </p>
          </div>
        </div>

        {/* ── Training panel ── */}
        <div className="info-card">
          <strong>Train the QNN to learn H's sign (paper eq. 47)</strong>
          <MathDisplay
            math={
              "U(\\theta) = \\exp\\!\\left(i\\sum_{\\langle ij\\rangle}\\theta_{ij} Z_i Z_j X_r\\right)"
            }
          />
          <p>
            With θ_ij = βJ_ij the circuit exactly represents the label function. Training
            finds these angles from labeled states alone.
          </p>

          <div className="metrics-grid" style={{ margin: "0.9rem 0" }}>
            <div className="metric-box">
              <div className="lbl">Epoch</div>
              <div className="val">{epoch}</div>
            </div>
            <div className="metric-box">
              <div className="lbl">Train acc</div>
              <div className="val" style={{ color: "var(--teal)" }}>
                {(trainAcc * 100).toFixed(0)}%
              </div>
            </div>
            <div className="metric-box">
              <div className="lbl">Test acc</div>
              <div className="val" style={{ color: "var(--cyan)" }}>
                {(testAcc * 100).toFixed(0)}%
              </div>
            </div>
            <div className="metric-box">
              <div className="lbl">Parameters</div>
              <div className="val">{EDGES.length}</div>
            </div>
          </div>

          <div className="qsl-theta-row">
            {thetas.map((t, k) => (
              <div key={k} className="metric-box">
                <div className="lbl">θ_{EDGES[k][0]}{EDGES[k][1]}</div>
                <div className="val">{t.toFixed(3)}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "0.9rem" }}>
            <div className="mono-label" style={{ marginBottom: "0.4rem" }}>
              Accuracy over epochs
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
              <rect width={W} height={H} rx="12" fill="#081421" />
              <line x1="12" y1={H / 2} x2={W - 12} y2={H / 2}
                stroke="rgba(255,255,255,0.07)" />
              {history.length >= 2 ? (
                <>
                  <polyline points={sparkPts("train")} fill="none"
                    stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" />
                  <polyline points={sparkPts("test")} fill="none"
                    stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round"
                    strokeDasharray="6 4" />
                </>
              ) : (
                <text x={W / 2} y={H / 2 + 5} textAnchor="middle"
                  fill="rgba(155,176,197,0.5)"
                  fontFamily="IBM Plex Mono, monospace" fontSize="11">
                  Run training to see accuracy curve
                </text>
              )}
            </svg>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem" }}>
              <span style={{ color: "var(--teal)", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem" }}>
                — train
              </span>
              <span style={{ color: "var(--cyan)", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem" }}>
                ╌ test
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.9rem" }}>
            <button className="button" style={{ flex: 1 }} onClick={toggleTraining} type="button">
              {isRunning ? "Pause" : "Train QNN"}
            </button>
            <button className="button secondary" onClick={reset} type="button">Reset</button>
          </div>
        </div>
      </div>

      <div className="info-card" style={{ marginTop: "1rem" }}>
        <strong>The representation circuit (paper eqs. 43–45)</strong>
        <MathDisplay
          math={
            "U_H(\\beta) = e^{i\\beta H X_r} \\implies " +
            "\\langle\\psi,1|U_H^\\dagger Y_r U_H|\\psi,1\\rangle = " +
            "\\langle\\psi|\\sin(2\\beta H)|\\psi\\rangle \\approx 2\\beta\\langle\\psi|H|\\psi\\rangle"
          }
        />
        <p>
          For sufficiently small β the sign of the predicted label matches the true label.
          The paper's 8+1 qubit experiment achieved 97% test accuracy after ~1000 training
          states. The key point: this task has no classical counterpart when the states |ψ⟩
          have no compact classical description.
        </p>
      </div>
    </div>
  );
}
