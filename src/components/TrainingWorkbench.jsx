import { useEffect, useMemo, useRef, useState } from "react";
import {
  ALL_SAMPLES,
  THETA_METADATA,
  accuracy,
  empiricalRisk,
  gradientForSample,
  gradientNorm,
  labelForSample,
  lossForSample,
  predictExpectation,
  probabilityPlus,
  randomThetaMap,
  shiftedLosses,
} from "../lib/qnnMath";
import { MathDisplay, MathInline } from "./MathText";

function drawRoundedRect(context, x, y, width, height, radius) {
  const cornerRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + cornerRadius, y);
  context.arcTo(x + width, y, x + width, y + height, cornerRadius);
  context.arcTo(x + width, y + height, x, y + height, cornerRadius);
  context.arcTo(x, y + height, x, y, cornerRadius);
  context.arcTo(x, y, x + width, y, cornerRadius);
  context.closePath();
}

function drawHistoryChart(context, canvasWidth, canvasHeight, values, options) {
  const {
    color,
    maxValue,
    invert = false,
    formatValue = (value) => String(value),
    xLabel = "epochs",
    gridColor = "rgba(255,255,255,0.08)",
    axisColor = "rgba(255,255,255,0.2)",
    labelColor = "rgba(155,176,197,0.75)",
  } = options;

  const left = 54;
  const right = 18;
  const top = 22;
  const bottom = 30;
  const plotWidth = Math.max(canvasWidth - left - right, 1);
  const plotHeight = Math.max(canvasHeight - top - bottom, 1);
  const xStart = left;
  const xEnd = canvasWidth - right;
  const yTop = top;
  const yBottom = canvasHeight - bottom;
  const pointCount = values.length;

  context.clearRect(0, 0, canvasWidth, canvasHeight);

  drawRoundedRect(context, 0, 0, canvasWidth, canvasHeight, 18);
  context.fillStyle = "#081421";
  context.fill();

  context.save();
  context.beginPath();
  context.rect(xStart, yTop, plotWidth, plotHeight);
  context.clip();

  for (let index = 0; index <= 4; index += 1) {
    const y = yTop + (plotHeight * index) / 4;
    context.strokeStyle = gridColor;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(xStart, y);
    context.lineTo(xEnd, y);
    context.stroke();
  }

  context.restore();

  context.strokeStyle = axisColor;
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(xStart, yTop);
  context.lineTo(xStart, yBottom);
  context.lineTo(xEnd, yBottom);
  context.stroke();

  const yTickValues = [0, maxValue / 2, maxValue];
  const yTickPositions = [yBottom, yTop + plotHeight / 2, yTop];

  context.fillStyle = labelColor;
  context.font = "11px IBM Plex Mono, monospace";
  context.textAlign = "right";
  context.textBaseline = "middle";
  yTickValues.forEach((tickValue, index) => {
    context.fillText(formatValue(tickValue), left - 8, yTickPositions[index]);
  });

  context.textBaseline = "alphabetic";
  context.textAlign = "left";
  context.fillText("0", xStart, canvasHeight - 8);
  if (pointCount > 0) {
    context.textAlign = "right";
    context.fillText(String(pointCount), xEnd, canvasHeight - 8);
  }
  context.textAlign = "left";
  context.fillText(xLabel, xStart + 6, top - 4);

  if (pointCount === 0) {
    return;
  }

  const step = pointCount === 1 ? 0 : plotWidth / (pointCount - 1);
  context.strokeStyle = color;
  context.lineWidth = 4;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.beginPath();

  values.forEach((value, index) => {
    const normalized = maxValue === 0 ? 0 : Math.max(0, Math.min(value / maxValue, 1));
    const x = xStart + step * index;
    const y = yTop + (invert ? normalized * plotHeight : (1 - normalized) * plotHeight);
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });

  context.stroke();
}

function TrainingChartCanvas({ values, maxValue, color, invert = false, formatValue, xLabel, ariaLabel, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    const redraw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(Math.round(rect.width), 1);
      const actualHeight = Math.max(Math.round(rect.height), 1);
      const scale = window.devicePixelRatio || 1;

      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(actualHeight * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      drawHistoryChart(context, width, actualHeight, values, {
        color,
        maxValue,
        invert,
        formatValue,
        xLabel,
      });
    };

    redraw();

    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [values, maxValue, color, invert, formatValue, xLabel]);

  return <canvas ref={canvasRef} className="history-canvas" style={{ height }} aria-label={ariaLabel} role="img" />;
}

export function TrainingWorkbench() {
  const [task, setTask] = useState("majority");
  const [thetas, setThetas] = useState(() => randomThetaMap());
  const [epoch, setEpoch] = useState(0);
  const [learningRate, setLearningRate] = useState(0.14);
  const [history, setHistory] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const [latestSample, setLatestSample] = useState("1010");
  const [latestGradient, setLatestGradient] = useState(Array(8).fill(0));
  const [selectedThetaIndex, setSelectedThetaIndex] = useState(0);

  const risk = useMemo(() => empiricalRisk(thetas, task), [task, thetas]);
  const acc = useMemo(() => accuracy(thetas, task), [task, thetas]);
  const prediction = useMemo(() => predictExpectation(latestSample, thetas, task), [latestSample, task, thetas]);
  const shifted = useMemo(
    () => shiftedLosses(latestSample, thetas, task, selectedThetaIndex),
    [latestSample, selectedThetaIndex, task, thetas],
  );
  const focusedGradients = useMemo(() => gradientForSample(latestSample, thetas, task), [latestSample, task, thetas]);
  const selectedTheta = THETA_METADATA[selectedThetaIndex];
  const currentLoss = lossForSample(latestSample, thetas, task);
  const currentGradient = focusedGradients[selectedThetaIndex] ?? 0;
  const currentProbability = probabilityPlus(prediction);
  const gradMax = Math.max(...latestGradient.map((value) => Math.abs(value)), 0.001);

  useEffect(() => {
    if (!isTraining) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const batch = Array.from({ length: 4 }, () => ALL_SAMPLES[Math.floor(Math.random() * ALL_SAMPLES.length)]);
      const batchGradient = Array(8).fill(0);

      batch.forEach((sample) => {
        const sampleGradient = gradientForSample(sample, thetas, task);
        sampleGradient.forEach((value, index) => {
          batchGradient[index] += value / batch.length;
        });
      });

      const nextThetas = Object.fromEntries(
        THETA_METADATA.map((item, index) => [item.id, thetas[item.id] - learningRate * batchGradient[index]]),
      );
      const nextSample = batch[0];
      const nextRisk = empiricalRisk(nextThetas, task);
      const nextAccuracy = accuracy(nextThetas, task);
      const nextGradNorm = gradientNorm(nextSample, nextThetas, task);

      setThetas(nextThetas);
      setLatestSample(nextSample);
      setLatestGradient(batchGradient);
      setEpoch((value) => value + 1);
      setHistory((value) => [...value, { risk: nextRisk, acc: nextAccuracy, gradNorm: nextGradNorm }].slice(-80));
    }, 140);

    return () => window.clearInterval(interval);
  }, [isTraining, learningRate, task, thetas]);

  function resetTraining(nextTask = task) {
    setTask(nextTask);
    setThetas(randomThetaMap());
    setEpoch(0);
    setHistory([]);
    setLatestSample("1010");
    setLatestGradient(Array(8).fill(0));
    setIsTraining(false);
  }

  const lossSeries = history.map((item) => item.risk);
  const accSeries = history.map((item) => item.acc);
  const gradSeries = history.map((item) => item.gradNorm);
  const maxLoss = Math.max(...lossSeries, risk, 0.5);
  const maxGrad = Math.max(...gradSeries, 0.1);

  return (
    <div className="training-workbench">
      <div className="grid-2">
        <article className="panel">
          <div className="panel-header">
            <div>
              <div className="mono-label">Training loop</div>
              <h3>Watch the parameters move under quantum gradient updates.</h3>
            </div>
          </div>

          <div className="task-toggle">
            {["majority", "parity"].map((mode) => (
              <button
                key={mode}
                className={task === mode ? "active" : ""}
                onClick={() => resetTraining(mode)}
                type="button"
              >
                {mode === "majority" ? "Majority task" : "Parity task"}
              </button>
            ))}
          </div>

          <div className="info-card accent">
            <strong>How “backpropagation” appears here</strong>
            Classical networks push derivatives backward through layers. This QNN uses the same optimization idea, but each
            quantum gate exposes its derivative through two shifted circuit evaluations.
            <MathDisplay math={"\\frac{\\partial L}{\\partial \\theta_k}=\\frac{L(\\theta_k+\\pi/2)-L(\\theta_k-\\pi/2)}{2}"} />
            <MathDisplay math={"\\theta_k \\leftarrow \\theta_k-\\eta\\,\\frac{\\partial L}{\\partial \\theta_k}"} />
          </div>

          <div className="metrics-grid">
            <div className="metric-box">
              <div className="lbl">Epoch</div>
              <div className="val">{epoch}</div>
            </div>
            <div className="metric-box">
              <div className="lbl">Average loss</div>
              <div className="val">{risk.toFixed(3)}</div>
            </div>
            <div className="metric-box">
              <div className="lbl">Accuracy</div>
              <div className="val">{(acc * 100).toFixed(1)}%</div>
            </div>
            <div className="metric-box">
              <div className="lbl">Learning rate</div>
              <div className="val">{learningRate.toFixed(2)}</div>
            </div>
          </div>

          <div className="training-buttons">
            <button className="button" onClick={() => setIsTraining((value) => !value)} type="button">
              {isTraining ? "Pause training" : "Start training"}
            </button>
            <button className="button secondary" onClick={() => resetTraining()} type="button">
              Reset run
            </button>
          </div>

          <div className="slider-row training-slider">
            <label htmlFor="learning-rate">
              <span>Learning rate η</span>
              <span>{learningRate.toFixed(2)}</span>
            </label>
            <input
              id="learning-rate"
              type="range"
              min="0.02"
              max="0.35"
              step="0.01"
              value={learningRate}
              onChange={(event) => setLearningRate(Number(event.target.value))}
            />
          </div>

          <div className="info-card">
            <strong>Training example in focus</strong>
            Sample <code>{latestSample}</code> carries target label <code>{labelForSample(latestSample, task) > 0 ? "+1" : "-1"}</code>.
            The current circuit predicts <MathInline math={`\\hat y=${prediction.toFixed(3)}`} />, so the one-sample loss is{" "}
            <MathInline math={`L=${currentLoss.toFixed(3)}`} />.
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <div className="mono-label">Learning signals</div>
              <h3>Loss, accuracy, and gradient size during optimization.</h3>
            </div>
          </div>

          <div className="chart-card">
            <div className="mono-label">Empirical risk (Difference in the expected value of <MathInline math={`Y_{n+1}`}/> between the two states)</div>
            <TrainingChartCanvas
              values={lossSeries}
              maxValue={maxLoss}
              color="#ffd36b"
              formatValue={(value) => value.toFixed(2)}
              xLabel="epochs"
              ariaLabel="Training loss history"
              height="220px"
            />
          </div>

          <div className="chart-card dual-chart">
            <div>
              <div className="mono-label">Accuracy</div>
              <TrainingChartCanvas
                values={accSeries}
                maxValue={1}
                color="#78e9ff"
                formatValue={(value) => `${Math.round(value * 100)}%`}
                xLabel="epochs"
                ariaLabel="Training accuracy history"
                height="120px"
              />
            </div>
            <div>
              <div className="mono-label">Gradient norm</div>
              <TrainingChartCanvas
                values={gradSeries}
                maxValue={maxGrad}
                color="#ff95a6"
                formatValue={(value) => value.toFixed(3)}
                xLabel="epochs"
                ariaLabel="Gradient norm history"
                height="120px"
              />
            </div>
          </div>
        </article>
      </div>

      <div className="grid-2 training-bottom">
        <article className="panel">
          <div className="panel-header">
            <div>
              <div className="mono-label">Parameter shift</div>
              <h3>Inspect the gradient of one θ directly.</h3>
            </div>
          </div>

          <div className="theta-pill-row">
            {THETA_METADATA.map((item) => (
              <button
                key={item.id}
                className={`chip-button${selectedThetaIndex === item.index ? " active" : ""}`}
                onClick={() => setSelectedThetaIndex(item.index)}
                type="button"
              >
                {item.symbol}
              </button>
            ))}
          </div>

          <div className="info-card accent">
            <strong>
              {selectedTheta.symbol} in the {selectedTheta.layer} layer
            </strong>
            {selectedTheta.summary}
            <div className="formula-block">
              <MathDisplay math={selectedTheta.operatorLatex} />
            </div>
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

          <div className="info-card">
            <strong>Exact quantum gradient</strong>
            For the current focused sample, <MathInline math={selectedTheta.symbolLatex} /> has gradient{" "}
            <MathInline math={`\\frac{\\partial L}{\\partial ${selectedTheta.symbolLatex}}=${currentGradient.toFixed(4)}`} />. A
            positive value means the loss increases if this parameter grows, so gradient descent nudges it downward.
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <div className="mono-label">Latest update</div>
              <h3>See which parameters moved the most in the last step.</h3>
            </div>
          </div>

          <div className="grad-bars">
            {THETA_METADATA.map((item, index) => {
              const gradient = latestGradient[index];
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

          <div className="info-card">
            <strong>Why parity usually looks worse</strong>
            Majority changes smoothly as the number of ones changes, so nearby strings often want similar outputs. Parity flips
            label whenever one bit changes, which makes the optimization landscape more oscillatory and often less forgiving.
          </div>

          <div className="info-card">
            <strong>Current readout confidence</strong>
            The latest focused sample produces <MathInline math={`P(+1)=${(currentProbability * 100).toFixed(1)}\\%`} />. Training
            tries to push that probability toward the correct label without breaking the rest of the dataset.
          </div>
        </article>
      </div>
    </div>
  );
}
