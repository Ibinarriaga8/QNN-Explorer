import { basicsCards } from "../data/content";
import { PageIntro } from "../components/PageIntro";
import { QubitSimulator } from "../components/QubitSimulator";

export function BasicsPage() {
  return (
    <section className="page-hero">
      <div className="container">
        <PageIntro
          eyebrow="Quantum Basics"
          title="Learn what a qubit feels like before talking about learning."
          text="The goal of this page is intuition: what a qubit is, what superposition means, and why measurement turns a rich hidden state into a simple classical answer."
        />
        <div className="grid-2">
          <article className="panel">
            <div className="stack">
              {basicsCards.map((card) => (
                <div className="info-card" key={card.title}>
                  <strong>{card.title}</strong>
                  {card.text}
                </div>
              ))}
            </div>
          </article>
          <QubitSimulator />
        </div>
      </div>
    </section>
  );
}
