import { useState } from "react";
import { exampleData } from "../data/content";
import { renderExampleGraphic } from "./CircuitViews";

export function ExamplesInteractive() {
  const [example, setExample] = useState("parity");
  const item = exampleData[example];

  return (
    <div className="grid-2">
      <article className="panel">
        <div className="sample-switcher">
          {["parity", "majority"].map((key) => (
            <button
              key={key}
              className={`sample-button${example === key ? " active" : ""}`}
              onClick={() => setExample(key)}
              type="button"
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        <div dangerouslySetInnerHTML={{ __html: renderExampleGraphic(example) }} />
      </article>
      <article className="panel">
        <div className="stack">
          <div className="info-card accent">
            <strong>{item.title}</strong>
            <span>{item.description}</span>
          </div>
          <div className="metric-grid">
            {item.metrics.map((metric) => (
              <div className="metric-card" key={metric.label}>
                <div className="mono-label">{metric.label}</div>
                <span className="value">{metric.value}</span>
              </div>
            ))}
          </div>
          <div className="stack">
            {item.timeline.map((step) => (
              <div className="timeline-step" key={step.label}>
                <strong>{step.label}</strong>
                <span>{step.text}</span>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
