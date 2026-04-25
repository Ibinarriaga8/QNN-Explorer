export const N_QUBITS = 4;

export const ALL_SAMPLES = Array.from({ length: 2 ** N_QUBITS }, (_, value) =>
    value.toString(2).padStart(N_QUBITS, "0"),
);

export const DEFAULT_THETAS = [
    0.46, 0.88, 1.12, 0.72, -0.38, 0.54, -0.66, 0.41,
];

export const THETA_METADATA = [
    {
        index: 0,
        id: "theta1",
        symbol: "θ1",
        symbolLatex: "\\theta_1",
        layer: "ZX",
        qubit: "q0",
        color: "cyan",
        operator: "exp(i θ1 Z0 Xr)",
        operatorLatex: "U_{ZX}^{(0)}(\\theta_1)=e^{i\\theta_1 Z_0 X_r}",
        summary:
            "The sign of q0 decides whether the readout rotates forward or backward.",
    },
    {
        index: 1,
        id: "theta2",
        symbol: "θ2",
        symbolLatex: "\\theta_2",
        layer: "ZX",
        qubit: "q1",
        color: "cyan",
        operator: "exp(i θ2 Z1 Xr)",
        operatorLatex: "U_{ZX}^{(1)}(\\theta_2)=e^{i\\theta_2 Z_1 X_r}",
        summary: "Adds another data-conditioned rotation to the readout qubit.",
    },
    {
        index: 2,
        id: "theta3",
        symbol: "θ3",
        symbolLatex: "\\theta_3",
        layer: "ZX",
        qubit: "q2",
        color: "cyan",
        operator: "exp(i θ3 Z2 Xr)",
        operatorLatex: "U_{ZX}^{(2)}(\\theta_3)=e^{i\\theta_3 Z_2 X_r}",
        summary:
            "Continues the weighted sum that the readout qubit is collecting.",
    },
    {
        index: 3,
        id: "theta4",
        symbol: "θ4",
        symbolLatex: "\\theta_4",
        layer: "ZX",
        qubit: "q3",
        color: "cyan",
        operator: "exp(i θ4 Z3 Xr)",
        operatorLatex: "U_{ZX}^{(3)}(\\theta_4)=e^{i\\theta_4 Z_3 X_r}",
        summary:
            "Completes the first layer's signed accumulation across the four data qubits.",
    },
    {
        index: 4,
        id: "theta5",
        symbol: "θ5",
        symbolLatex: "\\theta_5",
        layer: "XX",
        qubit: "q0",
        color: "rose",
        operator: "exp(i θ5 X0 Xr)",
        operatorLatex: "U_{XX}^{(0)}(\\theta_5)=e^{i\\theta_5 X_0 X_r}",
        summary:
            "Starts the entangling layer that reshapes the readout response.",
    },
    {
        index: 5,
        id: "theta6",
        symbol: "θ6",
        symbolLatex: "\\theta_6",
        layer: "XX",
        qubit: "q1",
        color: "rose",
        operator: "exp(i θ6 X1 Xr)",
        operatorLatex: "U_{XX}^{(1)}(\\theta_6)=e^{i\\theta_6 X_1 X_r}",
        summary:
            "Adds a second entangling interaction between data and readout.",
    },
    {
        index: 6,
        id: "theta7",
        symbol: "θ7",
        symbolLatex: "\\theta_7",
        layer: "XX",
        qubit: "q2",
        color: "rose",
        operator: "exp(i θ7 X2 Xr)",
        operatorLatex: "U_{XX}^{(2)}(\\theta_7)=e^{i\\theta_7 X_2 X_r}",
        summary:
            "Sharpens or flattens the classifier response depending on the phase it adds.",
    },
    {
        index: 7,
        id: "theta8",
        symbol: "θ8",
        symbolLatex: "\\theta_8",
        layer: "XX",
        qubit: "q3",
        color: "rose",
        operator: "exp(i θ8 X3 Xr)",
        operatorLatex: "U_{XX}^{(3)}(\\theta_8)=e^{i\\theta_8 X_3 X_r}",
        summary: "Completes the second layer before the readout measurement.",
    },
];

export const CIRCUIT_STEPS = [
    { id: "input", label: "Input", short: "|z,1>" },
    { id: "theta1", label: "ZX θ1", short: "ZX1" },
    { id: "theta2", label: "ZX θ2", short: "ZX2" },
    { id: "theta3", label: "ZX θ3", short: "ZX3" },
    { id: "theta4", label: "ZX θ4", short: "ZX4" },
    { id: "theta5", label: "XX θ5", short: "XX1" },
    { id: "theta6", label: "XX θ6", short: "XX2" },
    { id: "theta7", label: "XX θ7", short: "XX3" },
    { id: "theta8", label: "XX θ8", short: "XX4" },
    { id: "measure", label: "Measure Y", short: "Y" },
];

export function createThetaMap(seed = DEFAULT_THETAS) {
    return Object.fromEntries(
        THETA_METADATA.map((item, index) => [item.id, seed[index]]),
    );
}

export function thetaArray(thetas) {
    return THETA_METADATA.map((item) => thetas[item.id]);
}

export function sampleToBits(sample) {
    return sample.split("").map(Number);
}

export function bitToSpin(bit) {
    return bit === 1 ? 1 : -1;
}

function clamp(value, lower, upper) {
    return Math.min(upper, Math.max(lower, value));
}

export function labelForSample(sample, task) {
    const ones = sampleToBits(sample).reduce((sum, bit) => sum + bit, 0);
    if (task === "parity") {
        return ones % 2 === 0 ? 1 : -1;
    }

    return ones >= N_QUBITS / 2 ? 1 : -1;
}

export function predictExpectation(sample, thetas, task = "majority") {
    const spins = sampleToBits(sample).map(bitToSpin);
    const values = thetaArray(thetas);
    const zxSum = spins.reduce(
        (total, spin, index) => total + values[index] * spin,
        0,
    );
    const xxSum = spins.reduce(
        (total, spin, index) => total + values[index + 4] * spin,
        0,
    );
    const baseSignal = clamp(Math.sin(zxSum) * Math.cos(xxSum), -1, 1);

    if (task !== "parity") {
        return baseSignal;
    }

    const paritySpin = spins.reduce((product, spin) => product * spin, 1);
    const paritySignal = Math.sin(values[0] - values[4]) * paritySpin;
    return clamp(0.55 * baseSignal + 0.45 * paritySignal, -1, 1);
}

export function probabilityPlus(expectation) {
    return clamp((expectation + 1) / 2, 0, 1);
}

export function lossForSample(sample, thetas, task) {
    return (
        1 -
        labelForSample(sample, task) * predictExpectation(sample, thetas, task)
    );
}

export function shiftedLosses(sample, thetas, task, thetaIndex) {
    const metadata = THETA_METADATA[thetaIndex];
    const thetaPlus = {
        ...thetas,
        [metadata.id]: thetas[metadata.id] + Math.PI / 2,
    };
    const thetaMinus = {
        ...thetas,
        [metadata.id]: thetas[metadata.id] - Math.PI / 2,
    };

    return {
        minus: lossForSample(sample, thetaMinus, task),
        current: lossForSample(sample, thetas, task),
        plus: lossForSample(sample, thetaPlus, task),
    };
}

export function gradientForSample(sample, thetas, task) {
    return THETA_METADATA.map((item, index) => {
        const shifted = shiftedLosses(sample, thetas, task, index);
        return (shifted.plus - shifted.minus) / 2;
    });
}

export function gradientNorm(sample, thetas, task) {
    const gradients = gradientForSample(sample, thetas, task);
    return Math.sqrt(gradients.reduce((sum, value) => sum + value ** 2, 0));
}

export function empiricalRisk(thetas, task) {
    return (
        ALL_SAMPLES.reduce(
            (sum, sample) => sum + lossForSample(sample, thetas, task),
            0,
        ) / ALL_SAMPLES.length
    );
}

export function accuracy(thetas, task) {
    const correct = ALL_SAMPLES.reduce((sum, sample) => {
        const label = labelForSample(sample, task);
        const prediction = predictExpectation(sample, thetas, task);
        return sum + (prediction * label > 0 ? 1 : 0);
    }, 0);

    return correct / ALL_SAMPLES.length;
}

export function randomThetaMap() {
    const values = THETA_METADATA.map(
        () => (Math.random() - 0.5) * Math.PI * 1.6,
    );
    return createThetaMap(values);
}

export function partialState(sample, thetas, step) {
    const spins = sampleToBits(sample).map(bitToSpin);
    const values = thetaArray(thetas);
    const zxCount = Math.min(Math.max(step, 0), 4);
    const xxCount = Math.min(Math.max(step - 4, 0), 4);

    const zxSum = spins
        .slice(0, zxCount)
        .reduce((total, spin, index) => total + values[index] * spin, 0);
    const fullZxSum = spins.reduce(
        (total, spin, index) => total + values[index] * spin,
        0,
    );
    const xxSum = spins
        .slice(0, xxCount)
        .reduce((total, spin, index) => total + values[index + 4] * spin, 0);
    const signal =
        step === 0
            ? 0
            : clamp(
                  Math.sin(zxCount === 4 ? fullZxSum : zxSum) * Math.cos(xxSum),
                  -1,
                  1,
              );

    return {
        zxCount,
        xxCount,
        zxSum: zxCount === 4 ? fullZxSum : zxSum,
        xxSum,
        expectation: step >= 9 ? predictExpectation(sample, thetas) : signal,
    };
}

export function stepTrace(sample, thetas) {
    return CIRCUIT_STEPS.map((_, index) => partialState(sample, thetas, index));
}
