"use client";

import type { Locale } from "@/lib/i18n/config";
import { academyLessonText } from "@/lib/academy/academyLessonText";
import { Download, ExternalLink, FileText } from "lucide-react";
import type { AcademyResource } from "@/types/academy";
import { isSafeAcademyResourceUrl } from "@/lib/academy/academyPresentation";

type LessonResourcesProps = {
  locale?: Locale;
  resources: AcademyResource[];
};

export function LessonResources({
  locale = "en",
  resources,
}: LessonResourcesProps) {
  const tr = academyLessonText(locale);
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
        <span className="section-kicker">{tr("Course materials")}</span>
        <h2 id="lesson-resources-title">{tr("Lesson resources")}</h2>
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
              target={resource.downloadable ? undefined : "_blank"}
              rel={resource.downloadable ? undefined : "noreferrer noopener"}
              download={resource.downloadable ? "" : undefined}
            >
              {resource.downloadable ? (
                <Download size={17} aria-hidden="true" />
              ) : (
                <ExternalLink size={17} aria-hidden="true" />
              )}
              <span>{resource.downloadable ? tr("Download") : tr("Open")}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
