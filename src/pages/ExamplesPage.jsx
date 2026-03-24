import { PageIntro } from "../components/PageIntro";
import { ExamplesInteractive } from "../components/ExamplesInteractive";

export function ExamplesPage() {
  return (
    <section className="page-hero">
      <div className="container">
        <PageIntro
          eyebrow="Examples"
          title="Compare parity and majority through an interactive explanation."
          text="This page isolates one of the paper's most important teaching moments: some tasks are simply much easier to optimize than others."
        />
        <ExamplesInteractive />
      </div>
    </section>
  );
}
