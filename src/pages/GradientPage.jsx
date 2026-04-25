// src/pages/GradientPage.jsx
import { PageIntro } from "../components/PageIntro";
import { AuxiliaryGradientCircuit } from "../components/AuxiliaryGradientCircuit";
import { MathDisplay } from "../components/MathText";

export function GradientPage() {
  return (
    <section className="page-hero">
      <div className="container">
        <PageIntro
          eyebrow="Exact Quantum Gradients"
          title="Two methods for computing ∂L/∂θ without any approximation."
          text="Section 3 of the paper describes two circuit-based strategies for computing gradients exactly. Both avoid the numerical accuracy problems of finite differences and naturally bound gradient blow-up — a consequence of using unitary gates."
        />

        <div className="grid-2" style={{ marginBottom: "1.4rem" }}>
          <article className="panel">
            <div className="mono-label">Why Unitaries Help</div>
            <h3 style={{ margin: "0.55rem 0 0.85rem" }}>
              Bounded gradients come for free
            </h3>
            <div className="stack">
              <div className="info-card accent">
                <strong>The gradient norm bound (paper Section 1)</strong>
                <p>
                  Each gate has the form exp(iθΣ) where Σ is a generalized Pauli. The
                  derivative with respect to θ inserts Σ into the expectation. Since Pauli
                  operators have norm 1, the gradient of the loss with respect to any single
                  θ_k is bounded in absolute value by 2. The full gradient vector has norm
                  at most 2√L.
                </p>
                <MathDisplay
                  math={
                    "\\left|\\frac{\\partial L}{\\partial \\theta_k}\\right| \\leq 2 " +
                    "\\quad \\forall\\, k"
                  }
                />
                <p>
                  Classical neural networks can suffer exploding gradients and require
                  careful engineering (gradient clipping, batch norm) to stay stable.
                  Researchers in classical ML have recently started investigating unitary
                  layers to control this (refs. [6–9] in the paper). In the QNN, stability
                  comes for free from the physics.
                </p>
              </div>
              <div className="info-card">
                <strong>The two strategies</strong>
                <p>
                  <strong style={{ color: "var(--cyan)" }}>Auxiliary qubit method:</strong>{" "}
                  One circuit of depth 2L+2 per parameter. Requires one extra qubit. Measures
                  the imaginary part of a quantum overlap directly.
                </p>
                <p>
                  <strong style={{ color: "var(--gold)" }}>Parameter-shift rule:</strong>{" "}
                  Two circuit evaluations per parameter, same depth as the original circuit.
                  No extra qubit. Follows from the fact that the loss is sinusoidal in each θ.
                </p>
                <MathDisplay
                  math={
                    "\\frac{\\partial L}{\\partial \\theta_k} = " +
                    "\\frac{L(\\theta_k+\\pi/2) - L(\\theta_k-\\pi/2)}{2}"
                  }
                />
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="mono-label">Comparison</div>
            <h3 style={{ margin: "0.55rem 0 0.85rem" }}>
              When to use which method
            </h3>
            <div className="stack">
              <div className="info-card">
                <strong>Auxiliary qubit — circuit cost</strong>
                <p>
                  Depth 2L+2 (twice the original circuit depth plus the two inserted
                  operators). Requires one qubit beyond the n+1 qubits of the main circuit.
                  Computes the gradient in a single run per parameter via quantum
                  interference (the Hadamard test).
                </p>
                <MathDisplay
                  math={
                    "\\text{depth} = 2L + 2,\\quad \\text{qubits} = n + 2"
                  }
                />
              </div>
              <div className="info-card">
                <strong>Parameter-shift rule — circuit cost</strong>
                <p>
                  Two evaluations of the original circuit (depth L) with θ_k shifted by
                  ±π/2. No extra qubit needed. Naturally parallelizable — all 2L shifted
                  circuits can run independently. This is the method implemented in the
                  QNN Studio and Training pages of this explorer.
                </p>
                <MathDisplay
                  math={
                    "\\text{depth} = L,\\quad \\text{qubits} = n + 1,\\quad \\text{runs} = 2L"
                  }
                />
              </div>
              <div className="info-card accent">
                <strong>The deeper point</strong>
                <p>
                  Both methods give the exact gradient — not an approximation. The finite
                  difference approach costs O(1/δ⁶) measurements per component to achieve
                  δ-accuracy (paper Section 3). The quantum methods have no such cost.
                </p>
              </div>
            </div>
          </article>
        </div>

        <article className="panel">
          <div className="mono-label">Auxiliary Qubit Circuit — Step by Step</div>
          <h3 style={{ margin: "0.55rem 0 0.85rem" }}>
            The Hadamard test turns quantum interference into a gradient signal
          </h3>
          <AuxiliaryGradientCircuit />
        </article>
      </div>
    </section>
  );
}
