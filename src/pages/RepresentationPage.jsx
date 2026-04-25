// src/pages/RepresentationPage.jsx
import { PageIntro } from "../components/PageIntro";
import { ReedMullerExplorer } from "../components/ReedMullerExplorer";

export function RepresentationPage() {
  return (
    <section className="page-hero">
      <div className="container">
        <PageIntro
          eyebrow="Representation Theorem"
          title="Any Boolean label function fits a quantum circuit — but at what cost?"
          text="Section 2 of the paper establishes that the QNN can in principle express every label function via the Reed-Muller expansion. This is the quantum analog of the classical three-layer representation theorem. The catch: some functions require exponentially long circuits."
        />
        <ReedMullerExplorer />
      </div>
    </section>
  );
}
