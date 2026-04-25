import { PageIntro } from "../components/PageIntro";
import { insights, qnnBenefits, qnnCaveats } from "../data/content";

export function InsightsPage() {
  return (
    <section className="page-hero">
      <div className="container">
        <PageIntro
          eyebrow="Key Insights"
          title="What survives after the diagrams and animations."
          text="This final page compresses the paper’s main message: representation, trainability, and quantum usefulness are related but not identical questions."
        />
        <div className="insights-grid">
          {insights.map((item) => (
            <article className="panel" key={item.title}>
              <div className="mono-label">Takeaway</div>
              <h3 style={{ margin: "0.55rem 0 0.65rem" }}>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="section-intro" style={{ marginTop: "2.4rem" }}>
          <div className="eyebrow">Why Useful</div>
          <h2>What a quantum neural network can offer over a classical one.</h2>
          <p>
            The fairest answer is nuanced. A QNN is not automatically superior to a classical neural network, but it can become
            attractive when the data is quantum, when the hardware itself is the computation medium, or when a hybrid
            classical-quantum pipeline is a better fit than a purely classical model.
          </p>
        </div>

        <div className="benefit-grid">
          {qnnBenefits.map((item) => (
            <article className="panel benefit-card" key={item.title}>
              <div className="mono-label">Potential Benefit</div>
              <h3 style={{ margin: "0.55rem 0 0.8rem" }}>{item.title}</h3>
              <div className="comparison-block">
                <strong>Classical baseline</strong>
                <p>{item.classical}</p>
              </div>
              <div className="comparison-block accent">
                <strong>Why a QNN may help</strong>
                <p>{item.quantum}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="section-intro" style={{ marginTop: "2.4rem" }}>
          <div className="eyebrow">Important Limits</div>
          <h2>Why this should not be framed as “quantum always wins.”</h2>
          <p>
            The paper is careful here, and the site should be too. These are the main reasons the comparison has to stay honest.
          </p>
        </div>

        <div className="grid-2">
          {qnnCaveats.map((item) => (
            <article className="panel" key={item.title}>
              <div className="mono-label">Caveat</div>
              <h3 style={{ margin: "0.55rem 0 0.65rem" }}>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
