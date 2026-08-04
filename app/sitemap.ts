import type { MetadataRoute } from "next";
import {
  listPublishedCourses,
  listPublishedLearningPaths,
} from "@/lib/academy/academyRepository";
import { getPublicSiteUrl } from "@/lib/config";
import { getArticleSlugs } from "@/lib/sanity/client";
import { sitePagePaths } from "@/lib/site-pages";
import { localizeHref } from "@/lib/i18n/config";

const staticPaths = [
  "",
  "academy",
  "academy/courses",
  "academy/learning-paths",
  "analysis",
  "charts",
  "economic-calendar",
  "premium",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getPublicSiteUrl();
  const [articleResult, courseResult, pathResult] = await Promise.allSettled([
    getArticleSlugs(),
    listPublishedCourses(1_000),
    listPublishedLearningPaths(1_000),
  ]);
  const articlePaths =
    articleResult.status === "fulfilled"
      ? articleResult.value.map(({ slug }) => `analysis/${slug}`)
      : [];
  const coursePaths =
    courseResult.status === "fulfilled"
      ? courseResult.value.map(({ slug }) => `academy/courses/${slug}`)
      : [];
  const learningPathPaths =
    pathResult.status === "fulfilled"
      ? pathResult.value.map(({ slug }) => `academy/learning-paths/${slug}`)
      : [];
  const paths = [
    ...new Set([
      ...staticPaths,
      ...sitePagePaths,
      ...articlePaths,
      ...coursePaths,
      ...learningPathPaths,
    ]),
  ];

  return paths.flatMap((path) => {
    const pathname = path ? `/${path}` : "/";
    const englishUrl = new URL(pathname, `${siteUrl}/`).toString();
    const spanishUrl = new URL(
      localizeHref(pathname, "es"),
      `${siteUrl}/`,
    ).toString();
    const shared = {
      alternates: { languages: { en: englishUrl, es: spanishUrl } },
      changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
      priority: path === "" ? 1 : path.includes("/") ? 0.7 : 0.8,
    };
    return [
      { ...shared, url: englishUrl },
      { ...shared, url: spanishUrl },
    ];
  });
}
