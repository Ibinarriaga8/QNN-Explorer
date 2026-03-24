import { Link } from "react-router-dom";
import { lessonCards } from "../data/content";

export function HomePage() {
  return (
    <>
      <section className="hero page-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">Interactive final project</div>
            <h1>Navigate the paper as a guided React learning experience.</h1>
            <p>
              Instead of one huge scroll, this version is organized like a small educational app. Each route focuses on one question:
              what a qubit is, how circuits look, how the model predicts, how training works, and what the paper really teaches.
            </p>
            <div className="hero-actions">
              <Link className="button" to="/basics">
                Start with basics
              </Link>
              <Link className="button secondary" to="/lab">
                Jump to the QNN lab
              </Link>
            </div>
            <div className="tag-row">
              <span className="tag">React + router</span>
              <span className="tag">Multi-page navigation</span>
              <span className="tag">Paper-inspired circuit visuals</span>
            </div>
          </div>
          <aside className="panel hero-panel">
            <div className="panel-header">
              <div>
                <div className="mono-label">Project map</div>
                <h2>Seven routes, one coherent story</h2>
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
            <h2>Move through the topic page by page.</h2>
            <p>This keeps the repo easier to interpret and gives users a more natural sense of progress.</p>
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
