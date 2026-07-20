type LearningPathProgressProps = {
  completed: number;
  historicalCompletion?: boolean;
  optionalCompleted: number;
  percent: number;
  required: number;
  remainingLabel: string;
};

export function LearningPathProgress({
  completed,
  historicalCompletion = false,
  optionalCompleted,
  percent,
  required,
  remainingLabel,
}: LearningPathProgressProps) {
  const boundedPercent = Math.max(0, Math.min(percent, 100));
  return (
    <section className="learning-path-progress" aria-labelledby="path-progress">
      <div>
        <span className="section-kicker">Verified progression</span>
        <h2 id="path-progress">{Math.round(boundedPercent)}% complete</h2>
        {historicalCompletion ? (
          <p>
            Completed under an earlier path version. Newly added courses are
            supplemental and do not revoke completion.
          </p>
        ) : (
          <p>
            {completed} of {required} required courses complete
            {optionalCompleted
              ? ` · ${optionalCompleted} optional complete`
              : ""}
          </p>
        )}
      </div>
      <div
        className="learning-path-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(boundedPercent)}
        aria-label="Learning path completion"
      >
        <span style={{ width: `${boundedPercent}%` }} />
      </div>
      <small>{remainingLabel} estimated learning time remaining</small>
    </section>
  );
}
