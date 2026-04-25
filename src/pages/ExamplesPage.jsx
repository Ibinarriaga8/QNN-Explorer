import { PageIntro } from "../components/PageIntro";
import { ExamplesInteractive } from "../components/ExamplesInteractive";

export function ExamplesPage() {
  return (
    <section className="page-hero">
      <div className="container">
        <PageIntro
          eyebrow="Task Geometry"
          title="Compare why majority trains smoothly while parity resists learning."
          text="The paper’s lesson is not only that QNNs can represent functions, but that some functions are much friendlier to optimization. This page highlights that gap."
        />
        <ExamplesInteractive />
      </div>
    </section>
  );
}
