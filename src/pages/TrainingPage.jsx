import { PageIntro } from "../components/PageIntro";
import { TrainingWorkbench } from "../components/TrainingWorkbench";

export function TrainingPage() {
  return (
    <section className="page-hero">
      <div className="container">
        <PageIntro
          eyebrow="Gradients and Training"
          title="See how the QNN learns, not just what it predicts."
          text="This page focuses on the optimization loop from the paper: estimate the readout signal, convert it into a loss, compute exact parameter-shift gradients, and update thetas with stochastic gradient descent."
        />
        <TrainingWorkbench />
      </div>
    </section>
  );
}
