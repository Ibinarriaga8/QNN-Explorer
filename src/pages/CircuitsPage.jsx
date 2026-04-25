import { useState } from "react";
import { InteractiveCircuit } from "../components/InteractiveCircuit";
import { MathDisplay, MathInline } from "../components/MathText";
import { PageIntro } from "../components/PageIntro";
import { DEFAULT_THETAS, createThetaMap } from "../lib/qnnMath";

export function CircuitsPage() {
  const [sample, setSample] = useState("1011");
  const [task, setTask] = useState("majority");
  const [focusThetaIndex, setFocusThetaIndex] = useState(0);
  const [thetas] = useState(() => createThetaMap(DEFAULT_THETAS));

  return (
    <section className="page-hero">
      <div className="container">
        <PageIntro
          eyebrow="Circuit Walkthrough"
          title="Follow the Farhi–Neven QNN gate by gate."
          text="This page turns the paper’s diagram into a guided circuit explorer. Click any gate, step through the execution, and watch how the readout qubit accumulates the classifier signal."
        />

        <article className="panel">
          <InteractiveCircuit
            sample={sample}
            task={task}
            thetas={thetas}
            onSampleChange={setSample}
            onTaskChange={setTask}
            focusThetaIndex={focusThetaIndex}
            onFocusThetaChange={setFocusThetaIndex}
          />
        </article>

        <div className="grid-2 circuit-story-grid">
          <article className="panel">
            <div className="mono-label">Gate Guide</div>
            <h3 style={{ margin: "0.55rem 0 0.85rem" }}>What the trainable gates mean in the paper</h3>
            <div className="stack">
              <div className="info-card accent">
                <strong>Parameterized unitaries are the learnable layers</strong>
                Farhi and Neven set up the QNN as a sequence of few-qubit unitaries, each depending on a continuous parameter. The
                paper first writes the basic trainable gate family as
                <MathDisplay math={"U_a(\\theta)=e^{i\\theta\\Sigma_a}"} />
                where <MathInline math={"\\Sigma_a"} /> is a generalized Pauli operator on one or a few qubits. The whole model is
                then one ordered product of such gates.
                <MathDisplay math={"U(\\theta)=U_L(\\theta_L)U_{L-1}(\\theta_{L-1})\\cdots U_1(\\theta_1)"} />
              </div>
              <div className="info-card">
                <strong>ZX gates</strong>
                For subset-majority style constructions, the paper uses gates of the form
                <MathInline math={"Z_jX_r"} /> inside an exponential. Because <MathInline math={"Z_j"} /> is diagonal in the
                computational basis, the data qubit contributes only its sign, while <MathInline math={"X_r"} /> rotates the
                readout qubit.
                <MathDisplay math={"U_{MS}=\\exp\\!\\left(i\\frac{\\beta}{2}\\sum_j a_j Z_j X_r\\right)"} />
                In the browser explorer, each <MathInline math={"\\theta_j"} /> in the first layer scales one of these
                data-controlled readout rotations.
              </div>
              <div className="info-card">
                <strong>XX gates</strong>
                In the MNIST experiment, the authors eventually restricted the gate set to <MathInline math={"ZX"} /> and{" "}
                <MathInline math={"XX"} /> with the second qubit always the readout. Their reason is that these gates effectively
                rotate the readout around the x direction by an amount controlled by the data qubits. In this teaching model, the XX
                layer is the extra trainable mixing stage after the signed ZX accumulation.
                <MathDisplay math={"U_{XX}^{(j)}(\\theta)=e^{i\\theta X_jX_r}"} />
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="mono-label">Readout Rule</div>
            <h3 style={{ margin: "0.55rem 0 0.85rem" }}>How the circuit becomes a classifier</h3>
            <div className="stack">
              <div className="info-card accent">
                <strong>Input state</strong>
                The paper loads each classical sample into a computational-basis state and reserves one extra qubit for the output.
                <MathDisplay math={"\\lvert z,1\\rangle = \\lvert z_1 z_2 \\cdots z_n,1\\rangle"} />
              </div>
              <div className="info-card">
                <strong>Prediction</strong>
                The predicted label is not a bit straight away. It is the expectation value of a Pauli observable on the readout
                qubit, which lives between <MathInline math={"-1"} /> and <MathInline math={"+1"} />.
                <MathDisplay math={"\\hat y(z;\\theta)=\\langle z,1\\rvert U^{\\dagger}(\\theta)Y_rU(\\theta)\\lvert z,1\\rangle"} />
              </div>
              <div className="info-card">
                <strong>Loss and the role of θ</strong>
                Each <MathInline math={"\\theta_k"} /> is just the angle attached to one gate. Training means changing those
                angles so that the measured readout expectation aligns with the true label <MathInline math={"l(z)"} />.
                <MathDisplay math={"\\mathrm{loss}(\\theta,z)=1-l(z)\\,\\langle z,1\\rvert U^{\\dagger}(\\theta)Y_rU(\\theta)\\lvert z,1\\rangle"} />
              </div>
            </div>
          </article>
        </div>

        <div className="grid-2 circuit-story-grid">
          <article className="panel">
            <div className="mono-label">Architecture idea</div>
            <h3 style={{ margin: "0.55rem 0 0.85rem" }}>Why is there a dedicated readout qubit?</h3>
            <div className="stack">
              <div className="info-card">
                <strong>One qubit carries the decision</strong>
                Instead of measuring every qubit, the paper routes the prediction into one designated qubit. That gives the model a
                clean interface: prepare input, apply trainable unitaries, measure one observable.
              </div>
              <div className="info-card">
                <strong>ZX layer collects signed evidence</strong>
                The first layer uses each data qubit to decide the sign of a rotation on the readout, building a weighted sum that
                depends on the input string.
              </div>
              <div className="info-card">
                <strong>XX layer reshapes the decision boundary</strong>
                The second layer mixes data and readout in a more quantum way, creating a richer response than a single linear rule.
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="mono-label">Paper connection</div>
            <h3 style={{ margin: "0.55rem 0 0.85rem" }}>How this simplified explorer maps to the paper</h3>
            <div className="stack">
              <div className="info-card accent">
                <strong>Prediction observable</strong>
                The paper defines the output as the expectation value of a Pauli operator on the readout qubit. Here we visualize that
                as the evolving <MathInline math={"\\langle Y_r\\rangle"} /> signal.
              </div>
              <div className="info-card">
                <strong>Parameterized circuit</strong>
                The angles <MathInline math={"\\theta_1,\\ldots,\\theta_8"} /> stand in for the trainable gate parameters. Learning
                means moving those angles until the measured expectation matches the correct label.
              </div>
              <div className="info-card">
                <strong>Faithful idea, lighter model</strong>
                This app uses a compact teaching model so the circuit can stay interactive in the browser, while preserving the paper’s
                main logic: data encoding, trainable unitaries, readout measurement, and gradient-based updates. The paper’s MNIST
                experiment used 16 data qubits, one readout qubit, and three alternating layers each of <MathInline math={"ZX"} /> and{" "}
                <MathInline math={"XX"} />, for 96 parameters in total.
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
