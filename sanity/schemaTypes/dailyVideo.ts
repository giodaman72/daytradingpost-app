import { PlayIcon } from "@sanity/icons/Play";
import { defineField, defineType } from "sanity";
import { parseYouTubeId } from "../../lib/video/youtube";

/**
 * The daily market video shown in the homepage hero. Upload the video to
 * YouTube, then paste its link here; the newest published entry for each
 * language is the one the homepage plays.
 */
export const dailyVideoType = defineType({
  name: "dailyVideo",
  title: "Daily video",
  type: "document",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      initialValue: "en",
      options: {
        list: [
          { title: "English", value: "en" },
          { title: "Español", value: "es" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(8).max(120),
    }),
    defineField({
      name: "episode",
      title: "Episode number",
      type: "number",
      validation: (rule) => rule.integer().min(1).max(9999),
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube link",
      type: "url",
      description:
        "Paste the video's YouTube link (watch, youtu.be, live or shorts).",
      validation: (rule) =>
        rule
          .required()
          .uri({ scheme: ["https"] })
          .custom((value) =>
            !value || parseYouTubeId(value)
              ? true
              : "This doesn't look like a YouTube video link.",
          ),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Short summary",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      description: "Optional. Uses the YouTube thumbnail when empty.",
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
    }),
    defineField({
      name: "relatedArticle",
      title: "Related analysis",
      type: "reference",
      to: [{ type: "article" }],
      description: "Optional. Adds a 'Read the analysis' link under the video.",
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      episode: "episode",
      language: "language",
      publishedAt: "publishedAt",
      media: "thumbnail",
    },
    prepare({ title, episode, language, publishedAt, media }) {
      const parts = [
        episode ? `EP ${String(episode).padStart(2, "0")}` : null,
        language?.toUpperCase(),
        publishedAt ? String(publishedAt).slice(0, 10) : null,
      ].filter(Boolean);
      return { title, subtitle: parts.join(" · "), media };
    },
  },
});
