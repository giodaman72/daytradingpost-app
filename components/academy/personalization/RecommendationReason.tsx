import { Sparkles } from "lucide-react";

export function RecommendationReason({ children }: { children: string }) {
  return (
    <p className="academy-recommendation-reason">
      <Sparkles size={15} aria-hidden="true" />
      <span>
        <strong>Why this:</strong> {children}
      </span>
    </p>
  );
}
