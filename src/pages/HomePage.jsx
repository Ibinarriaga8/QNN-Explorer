import { Link } from "react-router-dom";
import { lessonCards } from "../data/content";

export function HomePage() {
  return (
    <>
      <section className="hero page-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">Interactive paper companion</div>
            <h1>Classification with Quantum Neural Networks on Near Term Processors</h1>
            <p>
              This project follows the Farhi-Neven paper: the circuit is interactive, the trainable angles are
              explicit, and the training route shows how parameter-shift gradients play the role of the learning signal.
            </p>
            <div className="hero-actions">
              <Link className="button" to="/circuits">
                Explore the circuit
              </Link>
              <Link className="button secondary" to="/training">
                See training dynamics
              </Link>
            </div>
            <div className="tag-row">
              <span className="tag">Interactive gate walkthrough</span>
              <span className="tag">Theta + gradient explorer</span>
              <span className="tag">Farhi-Neven paper mapping</span>
            </div>
          </div>
          <aside className="panel hero-panel">
            <div className="panel-header">
              <div>
                <div className="mono-label">Project map</div>
                <h2>Seven routes, one QNN learning story</h2>
              </div>
            </div>
            <img className="hero-visual" src="/assets/circuits/hero-overview.svg" alt="Overview of the quantum neural network learning journey" />
          </aside>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-intro">
            <div className="eyebrow">Lesson Structure</div>
            <h2>Move from intuition to optimization.</h2>
            <p>Each route answers one specific question about how the quantum neural network works and how it is trained.</p>
          </div>
          <div className="page-grid">
            {lessonCards.map((card) => (
              <article className="panel page-card" key={card.to}>
                <div className="mono-label">{card.eyebrow}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <Link className="button secondary" to={card.to}>
                  Open
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
