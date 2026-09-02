type LevelListProps = {
  label: string;
  levels: readonly string[];
  tone: "support" | "resistance";
  levelLabel?: string;
};

export function LevelList({
  label,
  levels,
  tone,
  levelLabel = "Level",
}: LevelListProps) {
  return (
    <section className={`analysis-level-group level-${tone}`}>
      <h3>{label}</h3>
      <ol>
        {levels.map((level, index) => (
          <li key={level}>
            <span>
              {levelLabel} {index + 1}
            </span>
            <strong>{level}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}
