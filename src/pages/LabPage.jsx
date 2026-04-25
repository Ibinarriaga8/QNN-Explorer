import { PageIntro } from "../components/PageIntro";
import { LabInteractive } from "../components/LabInteractive";

export function LabPage() {
  return (
    <section className="page-hero">
      <div className="container studio-container">
        <PageIntro
          eyebrow="QNN Studio"
          title="Tune thetas, inspect gradients, and test the classifier live."
          text="This is the hands-on page for the paper’s core algorithm. Move the trainable angles, click through the circuit, and see how the readout qubit, prediction, loss, and parameter-shift gradients all change together."
        />
        <LabInteractive />
      </div>
    </section>
  );
}
