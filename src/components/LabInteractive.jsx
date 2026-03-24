import { useMemo, useState } from "react";
import { labSamples, sliders } from "../data/content";
import { renderDynamicCircuit, renderLandscape } from "./CircuitViews";

function computePrediction(sample, params) {
  const bits = sample.split("").map(Number);
  const ones = bits.reduce((sum, bit) => sum + bit, 0);
  const score =
    Math.sin(params.theta1 + bits[0] * 0.8) * 0.92 +
    Math.cos(params.theta2 + ones * 0.52) * 0.75 +
    Math.sin(params.theta3 + bits[2] * 1.18) * 0.55;
  const positive = 1 / (1 + Math.exp(-score));
  return { score, positive, negative: 1 - positive };
}

export function LabInteractive() {
  const [sample, setSample] = useState(labSamples[0]);
  const [params, setParams] = useState(
    Object.fromEntries(sliders.map((slider) => [slider.id, slider.value])),
  );

  const prediction = useMemo(() => computePrediction(sample, params), [sample, params]);
  const positivePercent = Math.round(prediction.positive * 100);
  const negativePercent = 100 - positivePercent;
  const label = prediction.positive >= 0.5 ? "+1" : "-1";
  const bits = sample.split("");

  function updateSlider(id, value) {
    setParams((current) => ({ ...current, [id]: Number(value) }));
  }

  return (
    <div className="lab-grid">
      <article className="panel">
        <div className="panel-header">
          <div>
            <div className="mono-label">Controls</div>
            <h3>Choose input and tune the circuit</h3>
          </div>
        </div>
        <div className="sample-switcher">
          {labSamples.map((item) => (
            <button
              key={item}
              className={`sample-button${sample === item ? " active" : ""}`}
              onClick={() => setSample(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="slider-group">
          {sliders.map((slider) => (
            <div className="slider-row" key={slider.id}>
              <label htmlFor={slider.id}>
                <span>{slider.label}</span>
                <span>{params[slider.id].toFixed(2)}</span>
              </label>
              <input
                id={slider.id}
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={params[slider.id]}
                onChange={(event) => updateSlider(slider.id, event.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="info-card">
          <strong>Interpretation</strong>
          The sliders represent trainable parameters, like the learnable knobs the optimizer would adjust during training.
        </div>
      </article>

      <article className="panel">
        <div className="panel-header">
          <div>
            <div className="mono-label">Live circuit view</div>
            <h3>See the paper-style circuit update.</h3>
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: renderDynamicCircuit(sample, params) }} />
        <div className="mini-grid">
          <div className="info-card">
            <strong>Input encoding</strong>
            Bits {bits.join(" ")} are loaded as the starting pattern on data qubits.
          </div>
          <div className="info-card">
            <strong>Unitary mixing</strong>
            Gates U(theta) blend the input with trainable rotations and entangling structure.
          </div>
          <div className="info-card">
            <strong>Readout</strong>
            The final readout qubit carries a class bias of {(prediction.positive * 100).toFixed(0)}% toward +1.
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel-header">
          <div>
            <div className="mono-label">Prediction dashboard</div>
            <h3>Readout qubit and classification</h3>
          </div>
        </div>
        <div className="prediction-card">
          <div className="prediction-label">{label}</div>
          <p>
            {label === "+1"
              ? "The current circuit is more likely to produce class +1 because the readout qubit is biased toward 1."
              : "The current circuit is more likely to produce class -1 because the readout qubit is biased toward the opposite label."}
          </p>
        </div>
        <div className="meter-card">
          <div className="meter-header">
            <span className="mono-label">Readout meter</span>
            <span>{prediction.positive.toFixed(2)}</span>
          </div>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${positivePercent}%` }} />
          </div>
        </div>
        <div className="chart-card">
          <div className="mono-label">Probability bars</div>
          <div className="bar-row">
            <span>P(+1)</span>
            <div className="bar-track">
              <div className="bar-fill cyan" style={{ width: `${positivePercent}%` }} />
            </div>
            <span>{positivePercent}%</span>
          </div>
          <div className="bar-row">
            <span>P(-1)</span>
            <div className="bar-track">
              <div className="bar-fill rose" style={{ width: `${negativePercent}%` }} />
            </div>
            <span>{negativePercent}%</span>
          </div>
        </div>
        <div className="chart-card">
          <div className="mono-label">Decision landscape</div>
          <svg
            id="landscape-plot"
            viewBox="0 0 320 180"
            aria-label="Decision landscape plot"
            dangerouslySetInnerHTML={{ __html: renderLandscape(prediction.positive) }}
          />
        </div>
      </article>
    </div>
  );
}
