"use client";

import { Download, ExternalLink, FileText } from "lucide-react";
import type { AcademyResource } from "@/types/academy";
import { isSafeAcademyResourceUrl } from "@/lib/academy/academyPresentation";

type LessonResourcesProps = {
  resources: AcademyResource[];
};

export function LessonResources({ resources }: LessonResourcesProps) {
  const safeResources = resources.filter((resource) =>
    isSafeAcademyResourceUrl(resource.url),
  );
  if (!safeResources.length) return null;
  return (
    <section
      className="academy-resources"
      aria-labelledby="lesson-resources-title"
    >
      <div>
        <span className="section-kicker">Course materials</span>
        <h2 id="lesson-resources-title">Lesson resources</h2>
      </div>
      <ul>
        {safeResources.map((resource) => (
          <li key={`${resource.title}:${resource.url}`}>
            <span aria-hidden="true">
              <FileText size={20} />
            </span>
            <div>
              <strong>{resource.title}</strong>
              <small>{resource.description ?? resource.resourceType}</small>
              {resource.copyrightNotice ? (
                <small>{resource.copyrightNotice}</small>
              ) : null}
            </div>
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer noopener"
              download={resource.downloadable ? "" : undefined}
            >
              {resource.downloadable ? (
                <Download size={17} aria-hidden="true" />
              ) : (
                <ExternalLink size={17} aria-hidden="true" />
              )}
              <span>{resource.downloadable ? "Download" : "Open"}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
