import { PageIntro } from "../components/PageIntro";
import { insights } from "../data/content";

export function InsightsPage() {
  return (
    <section className="page-hero">
      <div className="container">
        <PageIntro
          eyebrow="Key Insights"
          title="What the paper teaches us about quantum machine learning."
          text="This final page summarizes the educational message of the project: quantum circuits can become classifiers, but architecture and optimization determine whether that potential turns into useful learning."
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
      </div>
    </section>
  );
}
