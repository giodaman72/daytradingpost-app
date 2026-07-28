import Link from "next/link";
import type { AssistantCitation } from "@/types/ai-citation";

export function AssistantCitationItem({
  citation,
  index,
}: {
  citation: AssistantCitation;
  index: number;
}) {
  return (
    <li>
      <Link
        href={citation.url}
        aria-label={`Citation ${index + 1}: ${citation.title}`}
      >
        <strong>{citation.title}</strong>
        <span>{citation.sourceType.replaceAll("_", " ")}</span>
      </Link>
      <p>{citation.excerpt}</p>
      <small>
        {citation.timestamp
          ? new Date(citation.timestamp).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "America/New_York",
            })
          : "Source date unavailable"}
        {citation.delayed ? " · Delayed data" : ""}
        {citation.fixture ? " · Development fixture" : ""}
        {citation.premium ? " · Premium source" : ""}
      </small>
    </li>
  );
}
