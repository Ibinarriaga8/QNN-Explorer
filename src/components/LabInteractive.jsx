import { useMemo, useState } from "react";
import { InteractiveCircuit } from "./InteractiveCircuit";
import { MathDisplay, MathInline } from "./MathText";
import {
  DEFAULT_THETAS,
  THETA_METADATA,
  createThetaMap,
  gradientForSample,
  labelForSample,
  lossForSample,
  predictExpectation,
  probabilityPlus,
  shiftedLosses,
} from "../lib/qnnMath";

export function LabInteractive() {
  const [sample, setSample] = useState("1011");
  const [task, setTask] = useState("majority");
  const [thetas, setThetas] = useState(() => createThetaMap(DEFAULT_THETAS));
  const [selectedThetaIndex, setSelectedThetaIndex] = useState(0);

  const expectation = useMemo(() => predictExpectation(sample, thetas), [sample, thetas]);
  const probability = probabilityPlus(expectation);
  const gradients = useMemo(() => gradientForSample(sample, thetas, task), [sample, task, thetas]);
  const shifted = useMemo(() => shiftedLosses(sample, thetas, task, selectedThetaIndex), [sample, selectedThetaIndex, task, thetas]);
  const selectedTheta = THETA_METADATA[selectedThetaIndex];
  const target = labelForSample(sample, task);
  const loss = lossForSample(sample, thetas, task);
  const gradMax = Math.max(...gradients.map((value) => Math.abs(value)), 0.001);

  function updateTheta(id, value) {
    setThetas((current) => ({ ...current, [id]: Number(value) }));
  }

  function resetThetas() {
    setThetas(createThetaMap(DEFAULT_THETAS));
  }

  return (
    <div className="lab-studio">
      <article className="panel">
        <div className="panel-header">
          <div>
            <div className="mono-label">Trainable angles</div>
            <h3>θ values are the knobs the optimizer learns.</h3>
          </div>
        </div>

        <div className="info-card accent">
          <strong>What a theta means</strong>
          Each <MathInline math={"\\theta_k"} /> sets the strength of one gate in the circuit. Training does not change the circuit
          topology; it only changes these angles until the readout qubit responds correctly to the dataset.
        </div>

        <div className="slider-cluster">
          {["ZX", "XX"].map((layer) => (
            <div key={layer}>
              <div className="slider-cluster-title">{layer} layer</div>
              <div className="slider-group">
                {THETA_METADATA.filter((item) => item.layer === layer).map((item) => (
                  <div className="slider-row" key={item.id}>
                    <label htmlFor={item.id}>
                      <span>{item.symbol}</span>
                      <span>{thetas[item.id].toFixed(2)}</span>
                    </label>
                    <input
                      id={item.id}
                      type="range"
                      min="-3.14"
                      max="3.14"
                      step="0.01"
                      value={thetas[item.id]}
                      onChange={(event) => updateTheta(item.id, event.target.value)}
                    />
                    <div className="slider-helper">
                      <MathInline math={item.operatorLatex} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="training-buttons">
          <button className="button secondary" onClick={resetThetas} type="button">
            Reset to paper-style seed
          </button>
        </div>
      </article>

      <article className="panel lab-circuit-panel">
        <div className="panel-header">
          <div>
            <div className="mono-label">Circuit walkthrough</div>
            <h3>Step through the classifier and watch the readout build its answer.</h3>
          </div>
        </div>
        <InteractiveCircuit
          sample={sample}
          task={task}
          thetas={thetas}
          onSampleChange={setSample}
          onTaskChange={setTask}
          focusThetaIndex={selectedThetaIndex}
          onFocusThetaChange={setSelectedThetaIndex}
        />
      </article>

      <article className="panel">
        <div className="panel-header">
          <div>
            <div className="mono-label">Prediction and gradients</div>
            <h3>Connect the circuit output to the learning signal.</h3>
          </div>
        </div>

        <div className="prediction-card">
          <div className="prediction-label">{expectation >= 0 ? "+1" : "-1"}</div>
          <p>
            The readout qubit currently predicts <MathInline math={`\\hat y=${expectation.toFixed(3)}`} />. For task <code>{task}</code>, sample{" "}
            <code>{sample}</code> should be labeled <code>{target > 0 ? "+1" : "-1"}</code>.
          </p>
        </div>

        <div className="meter-card">
          <div className="meter-header">
            <span className="mono-label">P(+1)</span>
            <span>{(probability * 100).toFixed(1)}%</span>
          </div>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${probability * 100}%` }} />
          </div>
        </div>

        <div className="loss-row">
          <span className="lbl">Sample loss</span>
          <span className="val">{loss.toFixed(3)}</span>
        </div>

        <div className="info-card accent">
          <strong>Selected parameter: {selectedTheta.symbol}</strong>
          {selectedTheta.summary}
          <div className="formula-block">
            <MathDisplay math={selectedTheta.operatorLatex} />
          </div>
          <div className="shift-grid">
            <div className="metric-card">
              <div className="mono-label">
                <MathInline math={"L(\\theta-\\pi/2)"} />
              </div>
              <span className="value">{shifted.minus.toFixed(3)}</span>
            </div>
            <div className="metric-card">
              <div className="mono-label">
                <MathInline math={"L(\\theta)"} />
              </div>
              <span className="value">{shifted.current.toFixed(3)}</span>
            </div>
            <div className="metric-card">
              <div className="mono-label">
                <MathInline math={"L(\\theta+\\pi/2)"} />
              </div>
              <span className="value">{shifted.plus.toFixed(3)}</span>
            </div>
          </div>
          <p className="theta-footnote">
            Parameter-shift gradient:{" "}
            <MathInline
              math={`\\frac{\\partial L}{\\partial ${selectedTheta.symbolLatex}}=${gradients[selectedThetaIndex].toFixed(4)}`}
            />
            . If this value is positive, gradient descent will reduce {selectedTheta.symbol}; if it is negative, learning will
            increase it.
          </p>
        </div>

        <div className="grad-bars">
          {THETA_METADATA.map((item, index) => {
            const gradient = gradients[index];
            const width = `${(Math.abs(gradient) / gradMax) * 50}%`;

            return (
              <div className="grad-bar-row" key={item.id}>
                <div className="lbl">{item.symbol}</div>
                <div className="bar-track">
                  <div className="bar-center" />
                  <div className={`bar-fill ${gradient >= 0 ? "pos" : "neg"}`} style={{ width }} />
                </div>
                <div className="val">{gradient.toFixed(3)}</div>
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}
