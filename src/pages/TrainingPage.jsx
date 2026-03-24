import { PageIntro } from "../components/PageIntro";
import { TrainingChart } from "../components/TrainingChart";

export function TrainingPage() {
  return (
    <section className="page-hero">
      <div className="container">
        <PageIntro
          eyebrow="Training Story"
          title="Learning is a search through a landscape of better and worse parameters."
          text="This page focuses on the optimization side of the paper: reducing loss, following useful gradients, and understanding why some tasks remain hard to train."
        />
        <div className="grid-2">
          <TrainingChart />
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="mono-label">Optimization intuition</div>
                <h3>Why can training become difficult?</h3>
              </div>
            </div>
            <img className="panel-image" src="/assets/circuits/training-landscape.svg" alt="Training landscape" />
            <div className="stack">
              <div className="info-card">
                <strong>Good direction</strong>
                If a parameter update clearly changes the model output, training has a signal to follow.
              </div>
              <div className="info-card">
                <strong>Hard region</strong>
                If gradients become tiny, learning slows down even if a good solution exists somewhere in parameter space.
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
