import { PageIntro } from "../components/PageIntro";

export function CircuitsPage() {
  const cards = [
    {
      src: "/assets/circuits/paper-model.svg",
      alt: "Quantum classifier architecture",
      title: "Classifier architecture",
      text: "A compact picture of the input qubits, trainable unitary, and final measurement.",
    },
    {
      src: "/assets/circuits/deep-circuit.svg",
      alt: "Layered trainable circuit",
      title: "Layered trainable circuit",
      text: "This version highlights repeated gate blocks, suggesting why the circuit can be interpreted like a stack of learned transformations.",
    },
    {
      src: "/assets/circuits/readout-focus.svg",
      alt: "Readout qubit focus",
      title: "Readout qubit focus",
      text: "The final prediction is tied to one special qubit, which gives the model a clean classification interface.",
    },
  ];

  return (
    <section className="page-hero">
      <div className="container">
        <PageIntro
          eyebrow="Circuit Gallery"
          title="Study the paper through circuit diagrams, not only words."
          text="This page collects the main visual motifs behind the Farhi-Neven model: data encoding, repeated trainable blocks, and a dedicated readout qubit measured at the end."
        />
        <div className="gallery-grid">
          {cards.map((card) => (
            <article className="panel gallery-card" key={card.title}>
              <img src={card.src} alt={card.alt} />
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
