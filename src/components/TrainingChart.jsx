import { useEffect, useState } from "react";
import { trainingFrames } from "../data/content";

function pathFromPoints(points) {
  return points
    .map((point, index) => {
      const x = 30 + index * 50;
      return `${index === 0 ? "M" : "L"} ${x} ${point}`;
    })
    .join(" ");
}

export function TrainingChart() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((current) => (current + 1 < trainingFrames.length ? current + 1 : current));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  function replay() {
    setFrame(0);
  }

  const current = trainingFrames[frame];

  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <div className="mono-label">Loss animation</div>
          <h3>Watch loss decrease as training progresses.</h3>
        </div>
      </div>
      <svg id="loss-curve" viewBox="0 0 420 220" aria-label="Animated training loss curve">
        <rect width="420" height="220" rx="20" fill="#081421" />
        <g stroke="rgba(255,255,255,0.08)">
          <line x1="24" y1="36" x2="24" y2="190" />
          <line x1="24" y1="190" x2="396" y2="190" />
          <line x1="24" y1="150" x2="396" y2="150" />
          <line x1="24" y1="110" x2="396" y2="110" />
          <line x1="24" y1="70" x2="396" y2="70" />
        </g>
        <defs>
          <linearGradient id="lossGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffd36b" />
            <stop offset="100%" stopColor="#78e9ff" />
          </linearGradient>
        </defs>
        <path d={pathFromPoints(current.points)} fill="none" stroke="url(#lossGradient)" strokeWidth="4" strokeLinecap="round" />
        <text x="28" y="24" fill="#edf5ff" fontSize="12" fontFamily="IBM Plex Mono, monospace">
          training epochs
        </text>
      </svg>
      <div className="timeline-copy">{current.label}</div>
      <button className="button secondary" onClick={replay} type="button">
        Replay animation
      </button>
    </article>
  );
}
