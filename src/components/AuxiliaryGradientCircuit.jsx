// src/components/AuxiliaryGradientCircuit.jsx
import { useState } from "react";
import { MathDisplay } from "./MathText";

// Each step describes what has happened to the circuit so far.
const STEPS = [
  {
    id: "init",
    short: "Init",
    label: "Prepare joint state",
    formula:
      "|z,1\\rangle \\otimes \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}",
    description:
      "The main register holds the data state |z,1⟩. An auxiliary qubit is put into |+⟩ = (|0⟩+|1⟩)/√2 by a Hadamard gate. This is the standard setup for the Hadamard test — the aux qubit will act as a probe.",
    showCU: false,
    showH2: false,
    showMeas: false,
    showGrad: false,
  },
  {
    id: "cU",
    short: "C-iÛ",
    label: "Apply iÛ controlled on auxiliary",
    formula:
      "\\frac{1}{\\sqrt{2}}\\left(|z,1\\rangle|0\\rangle + i\\hat{U}(\\vec{\\theta})|z,1\\rangle|1\\rangle\\right)",
    description:
      "Apply iÛ to the main register only when the auxiliary qubit is |1⟩. Û is the gradient operator from paper eq. 24: the full circuit with Y_{n+1} and Σ_k inserted at position k, making the depth 2L+2. The factor of i converts the imaginary part of the overlap into a real-valued probability.",
    showCU: true,
    showH2: false,
    showMeas: false,
    showGrad: false,
  },
  {
    id: "hadamard",
    short: "H",
    label: "Hadamard on auxiliary qubit",
    formula:
      "\\frac{1}{2}\\bigl(|z,1\\rangle + i\\hat{U}|z,1\\rangle\\bigr)|0\\rangle + \\frac{1}{2}\\bigl(|z,1\\rangle - i\\hat{U}|z,1\\rangle\\bigr)|1\\rangle",
    description:
      "A second Hadamard on the auxiliary qubit makes the two branches interfere. The overlap ⟨z,1|Û|z,1⟩ now shows up as a difference in measurement probabilities — the key step that turns quantum interference into a measurable gradient signal.",
    showCU: true,
    showH2: true,
    showMeas: false,
    showGrad: false,
  },
  {
    id: "measure",
    short: "Meas",
    label: "Measure the auxiliary qubit",
    formula:
      "P(\\text{aux}=0) = \\frac{1}{2} - \\frac{1}{2}\\,\\mathrm{Im}\\langle z,1|\\hat{U}|z,1\\rangle",
    description:
      "The probability of measuring 0 on the auxiliary qubit encodes the imaginary part of ⟨z,1|Û|z,1⟩. No finite-difference approximation is needed — the estimate is exact (up to shot noise). More repetitions reduce statistical uncertainty.",
    showCU: true,
    showH2: true,
    showMeas: true,
    showGrad: false,
  },
  {
    id: "gradient",
    short: "∂L/∂θ",
    label: "Extract the gradient component",
    formula:
      "\\frac{\\partial L}{\\partial \\theta_k} = 2\\,\\mathrm{Im}\\langle z,1|\\hat{U}|z,1\\rangle = 2\\bigl(1 - 2P(0)\\bigr)",
    description:
      "The full gradient component for θ_k follows directly from P(0). Repeat for each of the L parameters (running L circuits of depth 2L+2) to build the complete gradient vector. Alternatively, the parameter-shift rule uses 2L evaluations at depth L but needs no auxiliary qubit.",
    showCU: true,
    showH2: true,
    showMeas: true,
    showGrad: true,
  },
];

// The SVG renders incrementally as stages are revealed.
function CircuitSVG({ step }) {
  const s = STEPS[step];
  // Example P(0) value for illustration
  const p0 = step >= 3 ? 0.71 : 0.5;
  const grad = (2 * (1 - 2 * p0)).toFixed(2);

  const DATA_WIRES = [72, 114, 156];
  const READOUT_Y = 192;
  const AUX_Y = 248;

  return (
    <svg
      viewBox="0 0 680 300"
      className="aux-circuit-svg"
      role="img"
      aria-label="Auxiliary qubit gradient circuit diagram"
    >
      <rect width="680" height="300" rx="24" fill="#081421" />

      {/* ── Wire labels ── */}
      <text x="10" y="77" className="svg-wire-label">q₀ |z₁⟩</text>
      <text x="10" y="119" className="svg-wire-label">q₁ |z₂⟩</text>
      <text x="10" y="161" className="svg-wire-label" style={{ fill: "rgba(255,149,166,0.9)" }}>
        r  |1⟩
      </text>
      <text x="10" y="253" className="svg-wire-label" style={{ fill: "rgba(255,211,107,0.9)" }}>
        aux |0⟩
      </text>

      {/* ── Data wires ── */}
      {DATA_WIRES.map((y) => (
        <line key={y} x1="112" y1={y} x2="620" y2={y} stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
      ))}
      <line x1="112" y1={READOUT_Y} x2="620" y2={READOUT_Y}
        stroke="rgba(255,149,166,0.5)" strokeWidth="2" strokeDasharray="8 6" />
      <line x1="112" y1={AUX_Y} x2="620" y2={AUX_Y}
        stroke="rgba(255,211,107,0.55)" strokeWidth="2.5" />

      {/* ── H₁ gate on aux ── */}
      <rect x="122" y="233" width="42" height="30" rx="10"
        fill="rgba(255,211,107,0.12)" stroke="rgba(255,211,107,0.8)" strokeWidth="1.5" />
      <text x="143" y="253" textAnchor="middle" fill="rgba(255,211,107,0.95)"
        fontFamily="IBM Plex Mono, monospace" fontSize="14" fontWeight="700">H</text>

      {/* ── Controlled-iÛ block ── */}
      {s.showCU ? (
        <>
          <rect x="212" y="58" width="170" height="148" rx="16"
            fill="rgba(120,233,255,0.1)" stroke="#78e9ff" strokeWidth="2" />
          <text x="297" y="88" textAnchor="middle" fill="#78e9ff"
            fontFamily="IBM Plex Mono, monospace" fontSize="14" fontWeight="700">iÛ(θ)</text>
          <text x="297" y="110" textAnchor="middle" fill="rgba(155,176,197,0.8)"
            fontFamily="IBM Plex Mono, monospace" fontSize="10">depth 2L + 2</text>
          <text x="297" y="130" textAnchor="middle" fill="rgba(255,211,107,0.75)"
            fontFamily="IBM Plex Mono, monospace" fontSize="10">U†Y_{"{n+1}"}Σ_k U</text>
          <text x="297" y="150" textAnchor="middle" fill="rgba(155,176,197,0.7)"
            fontFamily="IBM Plex Mono, monospace" fontSize="10">paper eq. 24</text>
          {/* Control vertical line */}
          <line x1="297" y1="206" x2="297" y2="248" stroke="rgba(255,211,107,0.8)" strokeWidth="2.5" />
          <circle cx="297" cy="248" r="8" fill="rgba(255,211,107,0.85)" />
          <circle cx="297" cy="248" r="4" fill="#081421" />
        </>
      ) : (
        <text x="297" y="130" textAnchor="middle" fill="rgba(155,176,197,0.3)"
          fontFamily="IBM Plex Mono, monospace" fontSize="12">iÛ (pending)</text>
      )}

      {/* ── H₂ gate on aux ── */}
      {s.showH2 ? (
        <>
          <rect x="432" y="233" width="42" height="30" rx="10"
            fill="rgba(255,211,107,0.12)" stroke="rgba(255,211,107,0.8)" strokeWidth="1.5" />
          <text x="453" y="253" textAnchor="middle" fill="rgba(255,211,107,0.95)"
            fontFamily="IBM Plex Mono, monospace" fontSize="14" fontWeight="700">H</text>
        </>
      ) : null}

      {/* ── Measurement ── */}
      {s.showMeas ? (
        <>
          <rect x="494" y="233" width="34" height="30" rx="9"
            fill="rgba(255,211,107,0.12)" stroke="rgba(255,211,107,0.8)" strokeWidth="1.5" />
          <text x="511" y="253" textAnchor="middle" fill="rgba(255,211,107,0.95)"
            fontFamily="IBM Plex Mono, monospace" fontSize="16">M</text>
          <line x1="528" y1="248" x2="570" y2="248" stroke="#ffd36b" strokeWidth="3" />
          <path d="M570 248 l-13 -10 M570 248 l-13 10" stroke="#ffd36b" strokeWidth="3" fill="none" />
          <text x="578" y="238" fill="rgba(120,233,255,0.9)"
            fontFamily="IBM Plex Mono, monospace" fontSize="11">P(0)={p0.toFixed(2)}</text>
          <text x="578" y="258" fill="rgba(255,149,166,0.8)"
            fontFamily="IBM Plex Mono, monospace" fontSize="11">P(1)={(1 - p0).toFixed(2)}</text>
        </>
      ) : null}

      {/* ── Gradient readout annotation ── */}
      {s.showGrad ? (
        <text x="340" y="288" textAnchor="middle" fill="#ffd36b"
          fontFamily="IBM Plex Mono, monospace" fontSize="12">
          ∂L/∂θ_k = 2(1 − 2·{p0.toFixed(2)}) = {grad}
        </text>
      ) : null}
    </svg>
  );
}

export function AuxiliaryGradientCircuit() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <div className="aux-circuit-explorer">
      <div className="circuit-step-strip" role="tablist">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            className={`step-chip${i === step ? " active" : ""}${i < step ? " done" : ""}`}
            onClick={() => setStep(i)}
            type="button"
          >
            {s.short}
          </button>
        ))}
      </div>

      <div className="aux-main-grid">
        <div className="aux-circuit-panel">
          <CircuitSVG step={step} />
        </div>

        <div className="stack">
          <div className="info-card accent">
            <strong>{current.label}</strong>
            <p>{current.description}</p>
            <MathDisplay math={current.formula} />
          </div>

          {step === 4 ? (
            <div className="info-card">
              <strong>Cost vs. parameter-shift rule</strong>
              <p>
                <strong style={{ color: "var(--cyan)" }}>Auxiliary qubit method:</strong> L
                circuit evaluations, depth 2L+2, requires one extra qubit. Exact gradient,
                no approximation.
              </p>
              <p>
                <strong style={{ color: "var(--gold)" }}>Parameter-shift rule:</strong> 2L
                circuit evaluations, depth L, no extra qubit. Also exact. Practical
                advantage when qubit count is the bottleneck.
              </p>
              <p>
                Both methods are described in the paper. The parameter-shift rule uses the
                fact that each gate has the form e^(iθΣ), so the loss is sinusoidal in each
                θ_k.
              </p>
            </div>
          ) : null}

          {step === 0 ? (
            <div className="info-card">
              <strong>Why not just finite differences?</strong>
              <p>
                Classical finite differences approximate ∂f/∂θ ≈ (f(θ+ε)−f(θ))/ε, which
                requires very precise function estimates to keep the error below O(ε²). The
                paper notes you need O(1/ε⁶) measurements per parameter component to achieve
                O(ε) gradient accuracy this way.
              </p>
              <p>
                The quantum gradient methods — both this circuit and the parameter-shift rule
                — give the exact gradient directly from circuit measurements, with no
                approximation error at all.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="info-card accent" style={{ marginTop: "1rem" }}>
        <strong>The gradient operator (paper eq. 23–25)</strong>
        <MathDisplay
          math={
            "\\frac{dL}{d\\theta_k} = 2\\,\\mathrm{Im}\\langle z,1|\\hat{U}|z,1\\rangle" +
            "\\quad\\text{where}\\quad" +
            "\\hat{U} = U_1^\\dagger\\!\\cdots U_L^\\dagger Y_{n+1} U_L \\cdots U_{k+1}\\Sigma_k U_k \\cdots U_1"
          }
        />
        <p>
          Û is just the full circuit with the Pauli observable Y and the generator Σ_k
          inserted around gate k. It is itself a valid quantum circuit of depth 2L+2.
        </p>
      </div>
    </div>
  );
}
