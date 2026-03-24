export function PageIntro({ eyebrow, title, text }) {
  return (
    <div className="section-intro">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}
