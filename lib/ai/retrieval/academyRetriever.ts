import { sitePages } from "@/lib/site-pages";
import type { RetrievalDocument } from "@/types/ai-context";

export function retrieveAcademyContent(): RetrievalDocument[] {
  const academy = sitePages.academy;
  return [
    {
      sourceType: "academy",
      sourceId: "academy-overview",
      title: academy.title,
      content: `${academy.description}\nPublished curriculum preview: ${academy.highlights.join("; ")}.`,
      url: "/academy",
      timestamp: null,
      premium: false,
      delayed: false,
      fixture: false,
      relevance: 55,
    },
  ];
}
