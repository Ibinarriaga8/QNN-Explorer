function gate(x, y, label, tone = "cyan") {
  const colors = {
    cyan: "#78e9ff",
    teal: "#6de0bb",
    gold: "#ffd36b",
    rose: "#ff95a6",
  };

  return `
    <g>
      <rect x="${x}" y="${y - 16}" width="62" height="32" rx="12" fill="rgba(255,255,255,0.06)" stroke="${colors[tone]}" stroke-width="1.4"></rect>
      <text x="${x + 31}" y="${y + 5}" text-anchor="middle" fill="${colors[tone]}" font-family="IBM Plex Mono, monospace" font-size="13">${label}</text>
    </g>
  `;
}

function wire(y, label) {
  return `
    <text x="12" y="${y + 5}" fill="#9bb0c5" font-family="IBM Plex Mono, monospace" font-size="12">${label}</text>
    <line x1="92" y1="${y}" x2="560" y2="${y}" stroke="rgba(255,255,255,0.24)" stroke-width="2"></line>
  `;
}

export function renderDynamicCircuit(sample, params) {
  const bits = sample.split("");
  return `
    <svg viewBox="0 0 580 220" role="img" aria-label="Dynamic paper-style circuit">
      <rect x="0" y="0" width="580" height="220" rx="22" fill="#081421"></rect>
      ${wire(56, `q0 |${bits[0]}>`)}
      ${wire(108, `q1 |${bits[1]}>`)}
      ${wire(160, `q2 |${bits[2]}>`)}
      ${wire(204, "r |1>")}
      ${gate(124, 56, `R ${params.theta1.toFixed(2)}`, "cyan")}
      ${gate(124, 108, `R ${params.theta2.toFixed(2)}`, "teal")}
      ${gate(124, 160, `X${bits[2]}`, "gold")}
      ${gate(210, 56, "U1", "teal")}
      ${gate(210, 108, "U2", "gold")}
      ${gate(210, 204, `B ${params.theta3.toFixed(2)}`, "rose")}
      <line x1="311" y1="56" x2="311" y2="204" stroke="#78e9ff" stroke-dasharray="4 6" opacity="0.7"></line>
      <circle cx="311" cy="56" r="7" fill="#78e9ff"></circle>
      <circle cx="311" cy="108" r="7" fill="#78e9ff"></circle>
      <circle cx="311" cy="160" r="7" fill="#78e9ff"></circle>
      <circle cx="311" cy="204" r="7" fill="#78e9ff"></circle>
      ${gate(360, 56, "U(theta)", "cyan")}
      ${gate(360, 108, "U(theta)", "cyan")}
      ${gate(360, 160, "U(theta)", "cyan")}
      ${gate(360, 204, "Read", "rose")}
      <line x1="470" y1="204" x2="520" y2="204" stroke="#ff95a6" stroke-width="3"></line>
      <path d="M520 204 l-12 -12 M520 204 l-12 12" stroke="#ff95a6" stroke-width="3" fill="none"></path>
      <text x="430" y="30" fill="#edf5ff" font-size="13" font-family="IBM Plex Mono, monospace">Farhi-Neven inspired classifier flow</text>
    </svg>
  `;
}

export function renderLandscape(score) {
  const points = Array.from({ length: 12 }, (_, index) => {
    const x = 18 + index * 26;
    const base = 110 + Math.sin(index * 0.7) * 26 + Math.cos(index * 0.45) * 18;
    return `${x},${base.toFixed(1)}`;
  }).join(" ");
  const markerX = 26 + score * 250;
  const markerY = 110 + Math.sin(score * 5) * 25 + Math.cos(score * 4) * 14;

  return `
    <rect x="0" y="0" width="320" height="180" rx="18" fill="#081421"></rect>
    <polyline points="${points}" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"></polyline>
    <polyline points="${points}" fill="none" stroke="#78e9ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
    <circle cx="${markerX.toFixed(1)}" cy="${markerY.toFixed(1)}" r="8" fill="#ffd36b"></circle>
    <text x="18" y="24" fill="#edf5ff" font-size="12" font-family="IBM Plex Mono, monospace">Decision score position</text>
    <text x="${Math.max(18, markerX - 18).toFixed(1)}" y="${(markerY - 16).toFixed(1)}" fill="#ffd36b" font-size="11" font-family="IBM Plex Mono, monospace">current</text>
  `;
}

export function renderExampleGraphic(type) {
  if (type === "majority") {
    return `
      <svg viewBox="0 0 520 280" role="img" aria-label="Majority example circuit explanation">
        <rect width="520" height="280" rx="22" fill="#081421"></rect>
        <text x="26" y="34" fill="#edf5ff" font-size="16" font-family="Space Grotesk, sans-serif">Majority behaves like a smoother counting rule</text>
        <text x="26" y="60" fill="#9bb0c5" font-size="12" font-family="IBM Plex Mono, monospace">input strings with more ones cluster together more naturally</text>
        <circle cx="118" cy="150" r="52" fill="rgba(109,224,187,0.12)" stroke="#6de0bb" stroke-width="2"></circle>
        <circle cx="264" cy="150" r="74" fill="rgba(120,233,255,0.10)" stroke="#78e9ff" stroke-width="2"></circle>
        <circle cx="404" cy="150" r="52" fill="rgba(255,211,107,0.10)" stroke="#ffd36b" stroke-width="2"></circle>
        <text x="91" y="155" fill="#6de0bb" font-size="18" font-family="IBM Plex Mono, monospace">001</text>
        <text x="236" y="155" fill="#78e9ff" font-size="18" font-family="IBM Plex Mono, monospace">011</text>
        <text x="376" y="155" fill="#ffd36b" font-size="18" font-family="IBM Plex Mono, monospace">111</text>
        <path d="M84 218 C154 244, 364 244, 438 216" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="3" stroke-dasharray="8 8"></path>
        <text x="178" y="252" fill="#edf5ff" font-size="13" font-family="IBM Plex Mono, monospace">decision boundary is easier to smooth</text>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 520 280" role="img" aria-label="Parity example circuit explanation">
      <rect width="520" height="280" rx="22" fill="#081421"></rect>
      <text x="26" y="34" fill="#edf5ff" font-size="16" font-family="Space Grotesk, sans-serif">Parity needs a delicate whole-pattern rule</text>
      <text x="26" y="60" fill="#9bb0c5" font-size="12" font-family="IBM Plex Mono, monospace">neighboring strings can belong to opposite labels</text>
      <circle cx="110" cy="138" r="22" fill="rgba(255,149,166,0.16)" stroke="#ff95a6" stroke-width="2"></circle>
      <circle cx="176" cy="190" r="22" fill="rgba(120,233,255,0.16)" stroke="#78e9ff" stroke-width="2"></circle>
      <circle cx="244" cy="122" r="22" fill="rgba(255,149,166,0.16)" stroke="#ff95a6" stroke-width="2"></circle>
      <circle cx="316" cy="186" r="22" fill="rgba(120,233,255,0.16)" stroke="#78e9ff" stroke-width="2"></circle>
      <circle cx="392" cy="120" r="22" fill="rgba(255,149,166,0.16)" stroke="#ff95a6" stroke-width="2"></circle>
      <path d="M82 170 C138 80, 210 236, 270 150 S386 70, 436 182" fill="none" stroke="#ffd36b" stroke-width="3"></path>
      <text x="88" y="143" fill="#ff95a6" font-size="14" font-family="IBM Plex Mono, monospace">even</text>
      <text x="153" y="195" fill="#78e9ff" font-size="14" font-family="IBM Plex Mono, monospace">odd</text>
      <text x="231" y="127" fill="#ff95a6" font-size="14" font-family="IBM Plex Mono, monospace">even</text>
      <text x="304" y="191" fill="#78e9ff" font-size="14" font-family="IBM Plex Mono, monospace">odd</text>
      <text x="378" y="125" fill="#ff95a6" font-size="14" font-family="IBM Plex Mono, monospace">even</text>
      <text x="144" y="252" fill="#edf5ff" font-size="13" font-family="IBM Plex Mono, monospace">small input changes can flip the label</text>
    </svg>
  `;
}
