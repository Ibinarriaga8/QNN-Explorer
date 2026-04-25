// src/pages/QuantumInputsPage.jsx
import { PageIntro } from "../components/PageIntro";
import { QuantumBatchDemo } from "../components/QuantumBatchDemo";
import { QuantumStateLabelingDemo } from "../components/QuantumStateLabelingDemo";

export function QuantumInputsPage() {
  return (
    <section className="page-hero">
      <div className="container">
        <PageIntro
          eyebrow="Quantum Inputs"
          title="What happens when the data itself is quantum?"
          text="Sections 3.4 and 3.5 of the paper go beyond classical data. First: classical data presented as quantum superpositions (batch learning). Second: labels defined by quantum state properties — a task with no classical counterpart."
        />

        {/* ── Section 3.4 ── */}
        <div className="section-intro" style={{ marginTop: "0.5rem" }}>
          <div className="eyebrow">Section 3.4</div>
          <h2>Classical data in quantum superposition</h2>
          <p>
            Each class of samples is encoded as a single quantum state. The empirical risk
            over the whole dataset becomes a single measurement. The paper reports an order
            of magnitude improvement in sample complexity over sequential training.
          </p>
        </div>

        <article className="panel" style={{ marginBottom: "2rem" }}>
          <QuantumBatchDemo />
        </article>

        {/* ── Section 3.5 ── */}
        <div className="section-intro">
          <div className="eyebrow">Section 3.5</div>
          <h2>Learning a property of quantum states</h2>
          <p>
            The label is the sign of ⟨ψ|H|ψ⟩ for an Ising-type Hamiltonian. This task has
            no classical neural network counterpart: classical networks cannot accept quantum
            states as input when those states have no compact classical description. The QNN
            trained to 97% test accuracy on 8+1 qubits in the paper's experiment.
          </p>
        </div>

        <article className="panel">
          <QuantumStateLabelingDemo />
        </article>
      </div>
    </section>
  );
}
