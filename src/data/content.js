export const navItems = [
  { to: "/", label: "Home" },
  { to: "/basics", label: "Basics" },
  { to: "/circuits", label: "Circuits" },
  { to: "/lab", label: "QNN Lab" },
  { to: "/training", label: "Training" },
  { to: "/examples", label: "Examples" },
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
    eyebrow: "2. Circuits",
    title: "Study paper-style circuit diagrams.",
    text: "See multiple circuit images that explain the classifier structure visually.",
    to: "/circuits",
  },
  {
    eyebrow: "3. QNN Lab",
    title: "Manipulate parameters and readout behavior.",
    text: "Choose inputs, move sliders, and inspect a live circuit and prediction dashboard.",
    to: "/lab",
  },
  {
    eyebrow: "4. Training",
    title: "Watch loss change and explore optimization.",
    text: "Animated loss plus optimization visuals connect intuition to the paper.",
    to: "/training",
  },
  {
    eyebrow: "5. Examples",
    title: "Compare parity and majority.",
    text: "Interactive comparisons show why some tasks are easier to learn than others.",
    to: "/examples",
  },
  {
    eyebrow: "6. Insights",
    title: "Close with the paper's big lessons.",
    text: "Summarizes what worked, what struggled, and why the field is still open.",
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
    title: "Trainable circuits are real learning models",
    text: "The paper shows that a quantum circuit with adjustable parameters can play the role of a classifier, not just a fixed physics experiment.",
  },
  {
    title: "Readout design matters",
    text: "Using a dedicated readout qubit makes the output interpretable: the model has a clear place to look when turning a quantum state into a class label.",
  },
  {
    title: "Optimization is the bottleneck",
    text: "Some tasks are limited less by expressiveness and more by whether gradients remain useful during training.",
  },
];
