import { PageIntro } from "../components/PageIntro";
import { LabInteractive } from "../components/LabInteractive";

export function LabPage() {
  return (
    <section className="page-hero">
      <div className="container">
        <PageIntro
          eyebrow="QNN Lab"
          title="Manipulate a simplified quantum neural network."
          text="Choose an input bit string, tune the circuit parameters, inspect the circuit image, and see how the readout qubit changes the predicted label."
        />
        <LabInteractive />
      </div>
    </section>
  );
}
