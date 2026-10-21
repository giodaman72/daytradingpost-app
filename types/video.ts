import type { Locale } from "@/lib/i18n/config";
import type { SanityImage } from "./article";

export type DailyVideo = {
  _id: string;
  language: Locale;
  title: string;
  episode?: number | null;
  youtubeUrl: string;
  publishedAt: string;
  summary?: string | null;
  thumbnail?: SanityImage | null;
  relatedArticle?: { slug: string; language: Locale } | null;
};
