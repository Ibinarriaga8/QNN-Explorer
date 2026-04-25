export const navItems = [
  { to: "/", label: "Home" },
  { to: "/basics", label: "Basics" },
  { to: "/circuits", label: "Circuit" },
  { to: "/lab", label: "QNN Studio" },
  { to: "/training", label: "Training" },
  { to: "/examples", label: "Tasks" },
  { to: "/insights", label: "Insights" },
];

export const lessonCards = [
  {
    eyebrow: "1. Basics",
    title: "Build intuition for qubits and measurement.",
    text: "Includes the interactive qubit simulator and simple gate actions.",
    to: "/basics",
  },
  {
    eyebrow: "2. Circuit",
    title: "Walk through the QNN gate by gate.",
    text: "An interactive circuit explorer replaces the old static SVG gallery.",
    to: "/circuits",
  },
  {
    eyebrow: "3. QNN Studio",
    title: "Tune thetas and connect them to prediction.",
    text: "Move the trainable angles, inspect exact gradients, and see the readout respond live.",
    to: "/lab",
  },
  {
    eyebrow: "4. Training",
    title: "Follow parameter-shift updates during learning.",
    text: "See stochastic gradient descent, loss curves, and theta updates as the QNN trains.",
    to: "/training",
  },
  {
    eyebrow: "5. Tasks",
    title: "Compare parity and majority.",
    text: "Interactive comparisons show why representation and optimization difficulty are different.",
    to: "/examples",
  },
  {
    eyebrow: "6. Insights",
    title: "Close with the paper's real takeaways.",
    text: "Summarizes what the QNN can express, what is hard to train, and where the open questions remain.",
    to: "/insights",
  },
];

export const basicsCards = [
  {
    title: "Qubit",
    text: "It is the quantum version of the basic information unit, but it evolves as a state rather than a fixed visible bit.",
  },
  {
    title: "Superposition",
    text: "A gate like H creates a balanced possibility structure where both outcomes can appear at measurement.",
  },
  {
    title: "Measurement",
    text: "You never directly observe the full state. You only see sampled outcomes based on probabilities.",
  },
  {
    title: "Several qubits",
    text: "When qubits interact, the circuit can store richer patterns than isolated independent bits.",
  },
];

export const labSamples = ["101", "110", "011", "111"];

export const sliders = [
  { id: "theta1", label: "Rotation angle theta1", min: 0, max: 3.14, step: 0.01, value: 1.08 },
  { id: "theta2", label: "Entangling angle theta2", min: 0, max: 3.14, step: 0.01, value: 1.76 },
  { id: "theta3", label: "Readout bias theta3", min: 0, max: 3.14, step: 0.01, value: 0.62 },
];

export const trainingFrames = [
  {
    label: "At the beginning, the parameters are not yet aligned with the task.",
    points: [168, 164, 160, 155, 151, 147, 143, 140],
  },
  {
    label: "Training finds a useful direction, so the error starts falling faster.",
    points: [168, 157, 146, 134, 121, 109, 98, 90],
  },
  {
    label: "The circuit becomes more consistent and the loss curve keeps dropping.",
    points: [168, 150, 132, 112, 94, 80, 65, 52],
  },
  {
    label: "Later updates refine the circuit rather than making huge changes.",
    points: [168, 144, 120, 97, 78, 60, 45, 32],
  },
];

export const exampleData = {
  parity: {
    title: "Parity is a hard global rule.",
    description:
      "The label depends on whether the number of 1s is even or odd. That means the circuit must coordinate all relevant bits together.",
    metrics: [
      { label: "Learning feel", value: "Difficult" },
      { label: "Gradient signal", value: "Can fade" },
      { label: "Paper lesson", value: "Optimization matters" },
    ],
    timeline: [
      { label: "Problem", text: "Parity is sensitive to a whole-pattern relationship, not just a simple count." },
      { label: "Result", text: "The paper highlights optimization trouble for these harder structured tasks." },
      { label: "Meaning", text: "A circuit may represent the answer and still be hard to train in practice." },
    ],
  },
  majority: {
    title: "Majority is a smoother decision rule.",
    description:
      "The label depends on whether most bits are 1. This makes the decision boundary feel more gradual and easier to learn.",
    metrics: [
      { label: "Learning feel", value: "Easier" },
      { label: "Gradient signal", value: "Clearer" },
      { label: "Paper lesson", value: "Learns better" },
    ],
    timeline: [
      { label: "Problem", text: "Majority behaves more like a smooth counting rule than a delicate global parity check." },
      { label: "Result", text: "This kind of task was much friendlier to optimization in the paper's experiments." },
      { label: "Meaning", text: "Task structure strongly affects whether quantum training stays informative." },
    ],
  },
};

export const insights = [
  {
    title: "Representation and trainability are different questions",
    text: "The paper shows that quantum circuits can represent rich Boolean label functions, but finding the right parameters is still an optimization problem with its own bottlenecks.",
  },
  {
    title: "A dedicated readout qubit makes the model legible",
    text: "By measuring one observable on one chosen qubit, the circuit turns a complex many-qubit state into a classifier output that can be trained against labels.",
  },
  {
    title: "The paper is exploratory, not a proof of quantum advantage",
    text: "Farhi and Neven demonstrate a workable supervised-learning framework on near-term style circuits, but they do not claim a clear classical advantage at the small sizes they simulate.",
  },
];

export const qnnBenefits = [
  {
    title: "Native access to quantum data",
    classical: "A classical network needs a compact classical description of the input.",
    quantum:
      "A QNN can take a quantum state directly as input, so it can be applied even when the state has no efficient classical description.",
  },
  {
    title: "Works inside exponential Hilbert space",
    classical: "Classical models act on explicit vectors whose size grows with the chosen encoding.",
    quantum:
      "An n-qubit device naturally evolves states in a 2^n-dimensional space, which may let a compact circuit manipulate patterns that are expensive to track classically.",
  },
  {
    title: "Gate set can match the hardware",
    classical: "Classical architectures are abstract software objects and do not benefit from quantum device structure.",
    quantum:
      "The paper's framework is designed for near-term processors: pick trainable one- and two-qubit gates that the hardware can actually implement and learn within that gate set.",
  },
  {
    title: "Hybrid pipelines are possible",
    classical: "A fully classical network must carry the whole task alone.",
    quantum:
      "Farhi and Neven explicitly point to hybrid architectures where classical layers compress ordinary data first and a smaller QNN handles the final decision stage.",
  },
];

export const qnnCaveats = [
  {
    title: "Not automatically better on ordinary classical data",
    text: "For small classical datasets like downsampled MNIST, classical networks remain strong baselines. The paper treats the QNN as a proof of principle, not a demonstrated replacement.",
  },
  {
    title: "Trainability can still be hard",
    text: "Some functions may be representable but still difficult to learn because gradients become uninformative or useful solutions occupy a tiny region of parameter space.",
  },
  {
    title: "The clearest advantage case is quantum input",
    text: "The strongest argument for usefulness comes when the data is itself quantum. In that regime a classical competitor may not even be able to read the full input efficiently.",
  },
];
