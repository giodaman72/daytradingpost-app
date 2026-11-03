import { redirect } from "next/navigation";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import type { AcademyCourseLanguage } from "@/types/academy";

type CourseWithLanguage = { language?: AcademyCourseLanguage | null };

/** Site locale a course belongs to; courses without a language are English. */
export function academyCourseLocale(course: CourseWithLanguage): Locale {
  return course.language === "es" ? "es" : "en";
}

/** Keep only courses taught in the given site locale. */
export function academyCoursesForLocale<T extends CourseWithLanguage>(
  courses: T[],
  locale: Locale,
): T[] {
  return courses.filter((course) => academyCourseLocale(course) === locale);
}

/** Link to a course path inside the part of the site that matches its language. */
export function academyCourseHref(course: CourseWithLanguage, path: string) {
  return localizeHref(path, academyCourseLocale(course));
}

/**
 * Spanish courses live under /es and English courses under the default
 * locale. Redirect when a course page is requested from the other locale.
 */
export async function enforceAcademyCourseLocale(
  course: CourseWithLanguage,
  path: string,
) {
  const locale = await getRequestLocale();
  if (locale !== academyCourseLocale(course))
    redirect(academyCourseHref(course, path));
}
