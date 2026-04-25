import { useEffect, useMemo, useState } from "react";
import {
  ALL_SAMPLES,
  CIRCUIT_STEPS,
  THETA_METADATA,
  labelForSample,
  partialState,
  probabilityPlus,
  predictExpectation,
  sampleToBits,
  stepTrace,
} from "../lib/qnnMath";
import { MathDisplay, MathInline } from "./MathText";

const WIRE_Y = [62, 108, 154, 200, 266];
const READOUT_Y = WIRE_Y[4];
const GATE_X = [202, 286, 370, 454, 566, 626, 686, 746];
const START_X = 116;
const END_X = 806;
const STEP_MAX = CIRCUIT_STEPS.length - 1;
const TRACE_BASE_Y = 116;
const TRACE_SCALE = 76;

function number(value) {
  return value >= 0 ? `+${value.toFixed(3)}` : value.toFixed(3);
}

function describeStep(step, sample, thetas, task) {
  const bits = sampleToBits(sample);
  const current = partialState(sample, thetas, step);
  const target = labelForSample(sample, task);

  if (step === 0) {
    return {
      title: "Prepare the input basis state",
      paragraphs: [
        `The paper starts from a computational-basis input state and one dedicated readout qubit. In this explorer the data register is loaded with ${sample}, while the readout starts in the state 1.`,
        "At this stage no trainable gate has acted yet, so the circuit is only storing the example that will be classified.",
      ],
      formulas: [`\\lvert z,1\\rangle = \\lvert ${sample},1\\rangle`],
    };
  }

  if (step >= 1 && step <= 4) {
    const gate = THETA_METADATA[step - 1];
    const bit = bits[step - 1];
    const sign = bit === 1 ? "+1" : "-1";
    return {
      title: `${gate.symbol} adds a signed ZX rotation`,
      paragraphs: [
        `This gate matches the paper's idea of using parameterized two-qubit unitaries whose second qubit is always the readout. The operator on q${step - 1} is Z, so the data qubit contributes only its sign.`,
        `Because q${step - 1} currently holds ${bit}, its z-value is ${sign}. That means ${gate.symbol} either increases or decreases the effective x-rotation seen by the readout qubit.`,
      ],
      formulas: [
        gate.operatorLatex,
        `\\Theta_{ZX}^{(${current.zxCount})} = \\sum_{j=1}^{${current.zxCount}} \\theta_j z_j = ${number(current.zxSum)}`,
      ],
    };
  }

  if (step >= 5 && step <= 8) {
    const gate = THETA_METADATA[step - 1];
    const bit = bits[step - 5];
    return {
      title: `${gate.symbol} reshapes the readout with the XX layer`,
      paragraphs: [
        `The MNIST experiment in the paper ultimately restricted the gate set to ZX and XX interactions, always with the readout as the second qubit. The motivation given there is that these gates effectively rotate the readout around the x direction by an amount controlled by the data qubits.`,
        `Here q${step - 5} has value ${bit}, and the XX layer adds another trainable contribution controlled by ${gate.symbol}. In this teaching model the accumulated XX contribution becomes the cosine factor that modulates the final readout.`,
      ],
      formulas: [
        gate.operatorLatex,
        `\\Theta_{XX}^{(${current.xxCount})} = \\sum_{j=1}^{${current.xxCount}} \\theta_{j+4} z_j = ${number(current.xxSum)}`,
      ],
    };
  }

  const finalExpectation = predictExpectation(sample, thetas);
  return {
    title: "Measure Y on the readout qubit",
    paragraphs: [
      `The paper defines the prediction as the expectation value of a Pauli observable on the readout qubit. In the notation used throughout the paper, that observable is Y on the last qubit.`,
      `For the current sample ${sample}, this circuit predicts ${number(finalExpectation)}. The target label for the ${task} task is ${target > 0 ? "+1" : "-1"}, so training would now use this measurement outcome to compute the loss.`,
    ],
    formulas: [
      "\\hat y(z;\\theta)=\\langle z,1\\rvert U^{\\dagger}(\\theta) Y_r U(\\theta) \\lvert z,1\\rangle",
      `\\hat y(${sample};\\theta) = ${number(finalExpectation)}`,
    ],
  };
}

function tracePath(states) {
  return states
    .map((state, index) => {
      const x = 28 + index * 53;
      const y = TRACE_BASE_Y - state.expectation * TRACE_SCALE;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function pointForState(state, index) {
  return {
    x: 28 + index * 53,
    y: TRACE_BASE_Y - state.expectation * TRACE_SCALE,
  };
}

function buildGateContributions(sample, thetas) {
  const bits = sampleToBits(sample);
  let zxAccumulator = 0;
  let xxAccumulator = 0;

  return THETA_METADATA.map((gate, index) => {
    const qubitIndex = index % 4;
    const bit = bits[qubitIndex];
    const spin = bit === 1 ? 1 : -1;
    const theta = thetas[gate.id];
    const signedAngle = theta * spin;

    if (gate.layer === "ZX") {
      zxAccumulator += signedAngle;
    } else {
      xxAccumulator += signedAngle;
    }

    return {
      ...gate,
      qubitIndex,
      bit,
      spin,
      theta,
      signedAngle,
      activeAccumulator: gate.layer === "ZX" ? zxAccumulator : xxAccumulator,
      zxAccumulator,
      xxAccumulator,
    };
  });
}

function GateHoverCard({ gate, contribution }) {
  const left = `${(GATE_X[gate.index] / 840) * 100}%`;
  const top = gate.layer === "ZX" ? "19%" : "31%";

  return (
    <div className="gate-hover-card" style={{ left, top }}>
      <div className="gate-hover-title">
        {gate.symbol} · {gate.layer} gate
      </div>
      <div className="gate-hover-copy">
        <MathInline math={gate.operatorLatex} />
      </div>
      <div className="gate-hover-copy">
        <MathInline math={`z_${contribution.qubitIndex}=${contribution.spin > 0 ? "+1" : "-1"}`} />
      </div>
      <div className="gate-hover-copy">
        <MathInline math={`${gate.symbolLatex} z_${contribution.qubitIndex}=${number(contribution.signedAngle)}`} />
      </div>
    </div>
  );
}

function ReadoutOrbit({ expectation, probability, targetLabel, predictionLabel }) {
  const radius = 66;
  const cx = 90;
  const cy = 90;
  const x = cx + expectation * radius * 0.82;
  const y = cy - Math.sqrt(Math.max(0, 1 - expectation ** 2)) * radius * 0.45;

  return (
    <div className="chart-card circuit-readout-visual">
      <div className="mono-label">Readout state</div>
      <svg viewBox="0 0 180 180" className="orbit-svg" aria-label="Approximate readout state view">
        <rect width="180" height="180" rx="20" fill="#081421" />
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        <ellipse cx={cx} cy={cy} rx={radius} ry={radius * 0.26} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        <line x1={cx - radius - 12} y1={cy} x2={cx + radius + 12} y2={cy} stroke="rgba(255,255,255,0.1)" strokeDasharray="6 6" />
        <line x1={cx} y1={cy - radius - 12} x2={cx} y2={cy + radius + 12} stroke="rgba(255,255,255,0.1)" strokeDasharray="6 6" />
        <text x={cx} y="18" className="svg-trace-label" textAnchor="middle">
          +Z
        </text>
        <text x={cx} y="170" className="svg-trace-label" textAnchor="middle">
          -Z
        </text>
        <text x="22" y={cy + 4} className="svg-trace-label" textAnchor="middle">
          -Y
        </text>
        <text x="158" y={cy + 4} className="svg-trace-label" textAnchor="middle">
          +Y
        </text>
        <line x1={cx} y1={cy} x2={x} y2={y} stroke={expectation >= 0 ? "#78e9ff" : "#ff95a6"} strokeWidth="3" />
        <circle cx={x} cy={y} r="6" fill={expectation >= 0 ? "#78e9ff" : "#ff95a6"} />
      </svg>
      <div className="circuit-mini-stats">
        <div className="mini-stat">
          <span className="mini-stat-label">Prediction</span>
          <span className="mini-stat-value">{predictionLabel}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">Target</span>
          <span className="mini-stat-value">{targetLabel}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">P(+1)</span>
          <span className="mini-stat-value">{(probability * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

function MeasurementBars({ probability }) {
  const plusHeight = 124 * probability;
  const minusHeight = 124 * (1 - probability);

  return (
    <div className="chart-card circuit-bars-card">
      <div className="mono-label">Measurement distribution</div>
      <svg viewBox="0 0 220 180" className="bars-svg" aria-label="Measurement probabilities">
        <rect width="220" height="180" rx="20" fill="#081421" />
        <line x1="28" y1="148" x2="192" y2="148" stroke="rgba(255,255,255,0.1)" />
        <rect x="52" y={148 - plusHeight} width="46" height={plusHeight} rx="10" fill="rgba(120,233,255,0.22)" stroke="#78e9ff" />
        <rect x="124" y={148 - minusHeight} width="46" height={minusHeight} rx="10" fill="rgba(255,149,166,0.18)" stroke="#ff95a6" />
        <text x="75" y={148 - plusHeight - 8} className="svg-trace-label" textAnchor="middle">
          {(probability * 100).toFixed(1)}%
        </text>
        <text x="147" y={148 - minusHeight - 8} className="svg-trace-label" textAnchor="middle">
          {((1 - probability) * 100).toFixed(1)}%
        </text>
        <text x="75" y="166" className="svg-trace-label" textAnchor="middle">
          P(+1)
        </text>
        <text x="147" y="166" className="svg-trace-label" textAnchor="middle">
          P(-1)
        </text>
      </svg>
    </div>
  );
}

export function InteractiveCircuit({
  sample,
  task,
  thetas,
  onSampleChange,
  onTaskChange,
  focusThetaIndex = 0,
  onFocusThetaChange,
  showDataControls = true,
}) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredGateIndex, setHoveredGateIndex] = useState(null);

  const trace = useMemo(() => stepTrace(sample, thetas), [sample, thetas]);
  const current = trace[step];
  const explanation = useMemo(() => describeStep(step, sample, thetas, task), [step, sample, thetas, task]);
  const expectation = step === STEP_MAX ? predictExpectation(sample, thetas) : current.expectation;
  const plusProbability = probabilityPlus(expectation);
  const predictionLabel = expectation >= 0 ? "+1" : "-1";
  const targetLabel = labelForSample(sample, task) > 0 ? "+1" : "-1";
  const pulseX = START_X + ((END_X - START_X) * step) / STEP_MAX;
  const gateContributions = useMemo(() => buildGateContributions(sample, thetas), [sample, thetas]);
  const activeGateIndex = hoveredGateIndex ?? (step >= 1 && step <= 8 ? step - 1 : focusThetaIndex);
  const activeGate = THETA_METADATA[activeGateIndex];
  const activeContribution = gateContributions[activeGateIndex];
  const bits = sampleToBits(sample);
  const expectationLabel = number(expectation);
  const probabilityLabel = (plusProbability * 100).toFixed(1);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setStep((currentStep) => {
        if (currentStep >= STEP_MAX) {
          setIsPlaying(false);
          return currentStep;
        }

        return currentStep + 1;
      });
    }, 1200);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  function jumpToStep(nextStep) {
    setStep(nextStep);
    if (nextStep !== STEP_MAX) {
      setIsPlaying(false);
    }
  }

  function handleGateClick(thetaIndex) {
    onFocusThetaChange?.(thetaIndex);
    jumpToStep(thetaIndex + 1);
  }

  return (
    <div className="interactive-circuit">
      <div className="circuit-toolbar">
        {showDataControls ? (
          <div className="circuit-inputs">
            <label className="control-label" htmlFor="sample-select">
              Input sample
            </label>
            <select id="sample-select" value={sample} onChange={(event) => onSampleChange(event.target.value)}>
              {ALL_SAMPLES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="task-toggle">
              {["majority", "parity"].map((mode) => (
                <button
                  key={mode}
                  className={task === mode ? "active" : ""}
                  onClick={() => onTaskChange(mode)}
                  type="button"
                >
                  {mode === "majority" ? "Majority" : "Parity"}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="circuit-inputs">
            <div className="inline-note">Sample {sample}</div>
            <div className="inline-note">Task {task}</div>
          </div>
        )}

        <div className="circuit-player">
          <button className="chip-button" onClick={() => jumpToStep(Math.max(step - 1, 0))} type="button">
            Prev
          </button>
          <button className="chip-button" onClick={() => setIsPlaying((currentValue) => !currentValue)} type="button">
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button className="chip-button" onClick={() => jumpToStep(Math.min(step + 1, STEP_MAX))} type="button">
            Next
          </button>
          <button className="chip-button" onClick={() => jumpToStep(0)} type="button">
            Reset
          </button>
        </div>
      </div>

      <div className="circuit-meta-strip">
        <div className="meta-pill">
          <span className="meta-pill-label">Stage</span>
          <span className="meta-pill-value">{CIRCUIT_STEPS[step].label}</span>
        </div>
        <div className="meta-pill">
          <span className="meta-pill-label">Focused gate</span>
          <span className="meta-pill-value">{activeGate.symbol}</span>
        </div>
        <div className="meta-pill">
          <span className="meta-pill-label">ZX sum</span>
          <span className="meta-pill-value">{number(current.zxSum)}</span>
        </div>
        <div className="meta-pill">
          <span className="meta-pill-label">XX sum</span>
          <span className="meta-pill-value">{number(current.xxSum)}</span>
        </div>
        <div className="meta-pill">
          <span className="meta-pill-label">Readout</span>
          <span className="meta-pill-value">{number(expectation)}</span>
        </div>
      </div>

      <div className="circuit-step-strip" role="tablist" aria-label="Circuit step selector">
        {CIRCUIT_STEPS.map((item, index) => (
          <button
            key={item.id}
            className={`step-chip${index === step ? " active" : ""}${index < step ? " done" : ""}`}
            onClick={() => jumpToStep(index)}
            type="button"
          >
            <span>{item.short}</span>
          </button>
        ))}
      </div>

      <div className="circuit-frame">
        {hoveredGateIndex !== null ? (
          <GateHoverCard gate={THETA_METADATA[hoveredGateIndex]} contribution={gateContributions[hoveredGateIndex]} />
        ) : null}
        <svg viewBox="0 0 840 320" role="img" aria-label="Interactive quantum circuit for the Farhi-Neven QNN">
          <defs>
            <linearGradient id="circuitPulse" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(120,233,255,0)" />
              <stop offset="80%" stopColor="rgba(120,233,255,0.35)" />
              <stop offset="100%" stopColor="rgba(255,211,107,0.92)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="840" height="320" rx="28" fill="#081421" />
          {Array.from({ length: 18 }, (_, index) => (
            <line
              key={`vx-${index}`}
              x1={index * 48}
              y1="0"
              x2={index * 48}
              y2="320"
              stroke="rgba(255,255,255,0.03)"
            />
          ))}
          {Array.from({ length: 8 }, (_, index) => (
            <line
              key={`hy-${index}`}
              x1="0"
              y1={index * 44}
              x2="840"
              y2={index * 44}
              stroke="rgba(255,255,255,0.02)"
            />
          ))}
          <rect x="156" y="14" width="338" height="18" rx="9" fill="rgba(120,233,255,0.08)" />
          <rect x="520" y="14" width="252" height="18" rx="9" fill="rgba(255,149,166,0.08)" />
          <text x="325" y="27" className="svg-section-label cyan" textAnchor="middle">
            ZX layer
          </text>
          <text x="646" y="27" className="svg-section-label rose" textAnchor="middle">
            XX layer
          </text>

          {WIRE_Y.map((y, index) => (
            <g key={y}>
              <text x="96" y={y + 5} className={`svg-wire-label${index === 4 ? " rose" : ""}`} textAnchor="end">
                {index === 4 ? "r |1>" : `q${index} |${sample[index]}>`}
              </text>
              <line
                x1={START_X}
                y1={y}
                x2={END_X}
                y2={y}
                stroke={index === 4 ? "rgba(255,149,166,0.56)" : "rgba(255,255,255,0.22)"}
                strokeDasharray={index === 4 ? "8 6" : undefined}
                strokeWidth={index === 4 ? 2.5 : 2}
              />
              {step > 0 ? (
                <line x1={START_X} y1={y} x2={pulseX} y2={y} stroke="url(#circuitPulse)" strokeWidth={index === 4 ? 3.2 : 2.6} />
              ) : null}
            </g>
          ))}

          {bits.map((bit, index) => (
            <g key={`bit-${index}`}>
              <rect x="120" y={WIRE_Y[index] - 14} width="24" height="22" rx="6" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" />
              <text x="132" y={WIRE_Y[index] + 1} className="svg-trace-label" textAnchor="middle">
                {bit === 1 ? "+1" : "-1"}
              </text>
            </g>
          ))}

          {THETA_METADATA.map((gate) => {
            const isCurrent = step === gate.index + 1;
            const isDone = step > gate.index + 1;
            const isFocused = activeGateIndex === gate.index;
            const x = GATE_X[gate.index];
            const wireIndex = gate.index % 4;
            const stroke =
              gate.color === "cyan"
                ? isCurrent || isFocused
                  ? "#78e9ff"
                  : "rgba(120,233,255,0.62)"
                : isCurrent || isFocused
                  ? "#ff95a6"
                  : "rgba(255,149,166,0.62)";
            const contribution = gateContributions[gate.index];

            return (
              <g
                key={gate.id}
                className="svg-gate"
                onClick={() => handleGateClick(gate.index)}
                onMouseEnter={() => setHoveredGateIndex(gate.index)}
                onMouseLeave={() => setHoveredGateIndex(null)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleGateClick(gate.index);
                  }
                }}
              >
                <line
                  x1={x}
                  y1={WIRE_Y[wireIndex]}
                  x2={x}
                  y2={READOUT_Y}
                  stroke={stroke}
                  strokeWidth={isCurrent || isFocused ? 3 : 2}
                  opacity={isDone ? 0.58 : 1}
                />
                <circle cx={x} cy={WIRE_Y[wireIndex]} r={isCurrent || isFocused ? 8 : 6} fill={stroke} opacity={isDone ? 0.76 : 1} />
                <circle cx={x} cy={READOUT_Y} r={isCurrent || isFocused ? 8 : 6} fill={stroke} opacity={isDone ? 0.76 : 1} />
                <rect
                  x={x - 28}
                  y={READOUT_Y - 56}
                  width="56"
                  height="30"
                  rx="15"
                  fill={isFocused ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}
                  stroke={stroke}
                  strokeWidth={isCurrent || isFocused ? 2.4 : 1.5}
                />
                <text x={x} y={READOUT_Y - 37} className="svg-gate-label" textAnchor="middle" fill={stroke}>
                  {gate.layer}
                </text>
                <text x={x} y={READOUT_Y - 63} className="svg-trace-label" textAnchor="middle">
                  {gate.symbol}={contribution.theta.toFixed(2)}
                </text>
                <text x={x} y={READOUT_Y + 20} className="svg-trace-label" textAnchor="middle">
                  {number(contribution.signedAngle)}
                </text>
              </g>
            );
          })}

          <line x1={END_X - 30} y1={READOUT_Y} x2={END_X + 6} y2={READOUT_Y} stroke="#ffd36b" strokeWidth="3" />
          <path d={`M ${END_X + 6} ${READOUT_Y} l -16 -11 M ${END_X + 6} ${READOUT_Y} l -16 11`} stroke="#ffd36b" strokeWidth="3" fill="none" />
          <text x={END_X - 6} y={READOUT_Y - 18} className={`svg-section-label${step === STEP_MAX ? " gold" : ""}`} textAnchor="end">
            Measure Y
          </text>
          {step === STEP_MAX ? (
            <text x={END_X + 10} y={READOUT_Y - 26} className="svg-pulse-label" textAnchor="start">
              {number(expectation)}
            </text>
          ) : null}

          <circle cx={pulseX} cy={READOUT_Y} r="9" fill="#ffd36b" opacity="0.95" />
          <text x={pulseX} y={READOUT_Y - 18} className="svg-pulse-label" textAnchor="middle">
            {CIRCUIT_STEPS[step].short}
          </text>
        </svg>
      </div>

      <div className="circuit-inspector-grid">
        <div className="info-card accent">
          <strong>{explanation.title}</strong>
          {explanation.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {explanation.formulas.map((formula) => (
            <MathDisplay key={formula} math={formula} />
          ))}
          <div className="formula-inline">
            <span>Current teaching-model signal</span>
            <MathDisplay math={`\\sin\\!\\left(${number(current.zxSum)}\\right)\\,\\cos\\!\\left(${number(current.xxSum)}\\right) = ${number(expectation)}`} />
          </div>
        </div>

        <div className="info-card circuit-gate-panel">
          <strong>Gate inspector</strong>
          <p>Hover a gate for a quick summary, or click one to pin the inspector while you step through the circuit.</p>
          <div className="circuit-gate-grid">
            <div className="circuit-gate-key">
              <span className="mono-label">Gate</span>
              <div className="gate-key-value">{activeGate.symbol}</div>
            </div>
            <div className="circuit-gate-key">
              <span className="mono-label">Layer</span>
              <div className="gate-key-value">{activeGate.layer}</div>
            </div>
            <div className="circuit-gate-key">
              <span className="mono-label">Qubit</span>
              <div className="gate-key-value">{activeGate.qubit}</div>
            </div>
            <div className="circuit-gate-key">
              <span className="mono-label">Input sign</span>
              <div className="gate-key-value">{activeContribution.spin > 0 ? "+1" : "-1"}</div>
            </div>
          </div>
          <MathDisplay math={activeGate.operatorLatex} />
          <div className="circuit-gate-stats">
            <div className="metric-box">
              <div className="lbl">θ value</div>
              <div className="val">{activeContribution.theta.toFixed(2)}</div>
            </div>
            <div className="metric-box">
              <div className="lbl">Signed angle</div>
              <div className="val">{number(activeContribution.signedAngle)}</div>
            </div>
            <div className="metric-box">
              <div className="lbl">Bit value</div>
              <div className="val">{activeContribution.bit}</div>
            </div>
            <div className="metric-box">
              <div className="lbl">Layer sum</div>
              <div className="val">{number(activeContribution.activeAccumulator)}</div>
            </div>
          </div>
          <p className="circuit-hint">
            {activeGate.summary}
          </p>
        </div>

        <div className="circuit-side-stack">
          <ReadoutOrbit
            expectation={expectation}
            probability={plusProbability}
            targetLabel={targetLabel}
            predictionLabel={predictionLabel}
          />
          <MeasurementBars probability={plusProbability} />
        </div>
      </div>

      <div className="circuit-analytics-grid">
        <div className="chart-card">
          <div className="mono-label">Readout trajectory</div>
          <svg viewBox="0 0 540 140" className="trace-svg" aria-label="Readout signal trace through the circuit">
            <rect x="0" y="0" width="540" height="140" rx="18" fill="#081421" />
            <line x1="24" y1="40" x2="512" y2="40" stroke="rgba(255,255,255,0.08)" />
            <line x1="24" y1="78" x2="512" y2="78" stroke="rgba(255,255,255,0.12)" strokeDasharray="6 6" />
            <line x1="24" y1="116" x2="512" y2="116" stroke="rgba(255,255,255,0.08)" />
            <line x1="24" y1="40" x2="24" y2="116" stroke="rgba(255,255,255,0.12)" />
            <text x="18" y="44" className="svg-trace-label" textAnchor="end">
              +1.0
            </text>
            <text x="18" y="82" className="svg-trace-label" textAnchor="end">
              0.0
            </text>
            <text x="18" y="120" className="svg-trace-label" textAnchor="end">
              -1.0
            </text>
            <text x="18" y="14" className="svg-trace-label" textAnchor="start">
              ⟨Yᵣ⟩
            </text>
            <line
              x1="24"
              y1={TRACE_BASE_Y - expectation * TRACE_SCALE}
              x2="512"
              y2={TRACE_BASE_Y - expectation * TRACE_SCALE}
              stroke="rgba(255,211,107,0.45)"
              strokeDasharray="5 5"
            />
            <path d={tracePath(trace)} fill="none" stroke="url(#traceGradient)" strokeWidth="4" strokeLinecap="round" />
            <defs>
              <linearGradient id="traceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78e9ff" />
                <stop offset="100%" stopColor="#ffd36b" />
              </linearGradient>
            </defs>
            {trace.map((state, index) => {
              const point = pointForState(state, index);
              return (
                <g key={CIRCUIT_STEPS[index].id}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={index === step ? 6 : 4}
                    fill={index === step ? "#ffd36b" : "#78e9ff"}
                  />
                  <text x={point.x} y="132" className="svg-trace-label" textAnchor="middle">
                    {CIRCUIT_STEPS[index].short}
                  </text>
                </g>
                );
              })}
            <text x="506" y={TRACE_BASE_Y - expectation * TRACE_SCALE - 6} className="svg-trace-label" textAnchor="end">
              {expectationLabel}
            </text>
          </svg>
          <div className="trajectory-consistency">
            <div className="mono-label">Consistency check</div>
            <p>
              This plot, the readout-state panel, and the measurement bars all use the same quantity:
              {" "}
              <MathInline math={`\\langle Y_r \\rangle = ${expectationLabel}`} />
              . The displayed probability is computed from it as{" "}
              <MathInline math={`P(+1)=\\frac{1+\\langle Y_r\\rangle}{2} = ${probabilityLabel}\\%`} />.
            </p>
          </div>
        </div>

        <div className="chart-card">
          <div className="mono-label">Current prediction rule</div>
          <MathDisplay math={`\\hat y = \\sin\\!\\left(${number(current.zxSum)}\\right)\\cos\\!\\left(${number(current.xxSum)}\\right)`} />
          <div className="metric-strip compact">
            <div className="metric-box">
              <div className="lbl">Prediction</div>
              <div className="val">{predictionLabel}</div>
            </div>
            <div className="metric-box">
              <div className="lbl">Target</div>
              <div className="val">{targetLabel}</div>
            </div>
            <div className="metric-box">
              <div className="lbl">P(+1)</div>
              <div className="val">{(plusProbability * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-card contribution-card">
        <div className="panel-header">
          <div>
            <div className="mono-label">Gate contributions</div>
            <h3>See how each θ interacts with the current input string.</h3>
          </div>
        </div>
        <div className="contribution-rows">
          {gateContributions.map((item) => {
            const width = `${Math.min(100, (Math.abs(item.signedAngle) / Math.PI) * 100)}%`;
            const isHighlighted = item.index === activeGateIndex;

            return (
              <button
                key={item.id}
                className={`contribution-row${isHighlighted ? " active" : ""}`}
                onClick={() => handleGateClick(item.index)}
                onMouseEnter={() => setHoveredGateIndex(item.index)}
                onMouseLeave={() => setHoveredGateIndex(null)}
                type="button"
              >
                <span className="contribution-label">{item.symbol}</span>
                <span className="contribution-kind">{item.layer}</span>
                <span className="contribution-sign">{item.spin > 0 ? "+1" : "-1"}</span>
                <span className="contribution-value">{number(item.signedAngle)}</span>
                <span className="contribution-bar">
                  <span className={`contribution-fill ${item.signedAngle >= 0 ? "pos" : "neg"}`} style={{ width }} />
                </span>
                <span className="contribution-qubit">{item.qubit}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
