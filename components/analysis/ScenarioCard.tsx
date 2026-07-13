type ScenarioCardProps = {
  direction: "bullish" | "bearish";
  children: React.ReactNode;
};

export function ScenarioCard({ direction, children }: ScenarioCardProps) {
  const title = direction === "bullish" ? "Bullish scenario" : "Bearish scenario";

  return (
    <section className={`scenario-card scenario-${direction}`}>
      <h2 className="scenario-label">
        <span aria-hidden="true">{direction === "bullish" ? "↗" : "↘"}</span>
        {title}
      </h2>
      <p>{children}</p>
    </section>
  );
}
