import { BookIcon } from "@sanity/icons/Book";
import { defineArrayMember, defineField, defineType } from "sanity";

const lessonTypes = [
  "text",
  "video",
  "mixed",
  "quiz",
  "assessment",
  "downloadable",
  "webinar-replay",
  "chart-practice",
  "external-resource",
];

export const academyLessonType = defineType({
  name: "academyLesson",
  title: "Academy lesson",
  type: "document",
  icon: BookIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Media and resources" },
    { name: "access", title: "Access and completion" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lessonType",
      type: "string",
      group: "content",
      options: {
        list: lessonTypes,
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: "body",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          marks: {
            annotations: [
              {
                name: "link",
                title: "HTTPS link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    type: "url",
                    validation: (rule) =>
                      rule.required().uri({ scheme: ["https"] }),
                  }),
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              validation: (rule) => rule.required().max(160),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "video",
      type: "academyVideo",
      group: "media",
      hidden: ({ document }) =>
        !["video", "mixed", "webinar-replay"].includes(
          String(document?.lessonType),
        ),
    }),
    defineField({
      name: "durationMinutes",
      type: "number",
      group: "content",
      validation: (rule) =>
        rule
          .integer()
          .min(1)
          .max(10_000)
          .custom((value, context) =>
            context.document?.status === "published" && !value
              ? "Published lessons require a duration estimate"
              : true,
          ),
    }),
    defineField({
      name: "resources",
      type: "array",
      group: "media",
      of: [defineArrayMember({ type: "academyResource" })],
      validation: (rule) => rule.max(30),
    }),
    defineField({
      name: "learningObjectives",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.unique().max(20),
    }),
    defineField({
      name: "instructor",
      type: "reference",
      group: "content",
      to: [{ type: "academyInstructor" }],
    }),
    defineField({
      name: "course",
      type: "reference",
      group: "content",
      to: [{ type: "academyCourse" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "module",
      type: "reference",
      group: "content",
      to: [{ type: "academyModule" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      type: "number",
      group: "content",
      validation: (rule) => rule.required().integer().min(1).max(10_000),
    }),
    defineField({
      name: "prerequisiteLessons",
      type: "array",
      group: "access",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "academyLesson" }],
          options: {
            filter: ({ document }) => ({
              filter: "_id != $id",
              params: { id: document._id.replace(/^drafts\./, "") },
            }),
          },
        }),
      ],
      validation: (rule) => rule.unique().max(30),
    }),
    defineField({
      name: "assessment",
      type: "reference",
      group: "access",
      to: [{ type: "academyAssessment" }],
      hidden: ({ document }) =>
        !["quiz", "assessment"].includes(String(document?.lessonType)),
    }),
    defineField({
      name: "externalUrl",
      type: "url",
      group: "media",
      hidden: ({ document }) => document?.lessonType !== "external-resource",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "requiredForCompletion",
      type: "boolean",
      group: "access",
      initialValue: true,
    }),
    defineField({
      name: "completionMode",
      type: "string",
      group: "access",
      initialValue: "manual",
      options: {
        list: [
          "manual",
          "content-viewed",
          "video-threshold",
          "quiz-passed",
          "assessment-passed",
          "external-confirmation",
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "accessLevel",
      type: "string",
      group: "access",
      initialValue: "free",
      options: { list: ["free", "premium"], layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      type: "string",
      group: "access",
      initialValue: "draft",
      options: {
        list: ["draft", "review", "scheduled", "published", "archived"],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "publishedAt", type: "datetime", group: "access" }),
    defineField({ name: "updatedAt", type: "datetime", group: "access" }),
    defineField({
      name: "version",
      type: "number",
      group: "access",
      initialValue: 1,
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: "relatedArticles",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "reference", to: [{ type: "article" }] })],
      validation: (rule) => rule.unique().max(20),
    }),
    defineField({
      name: "relatedMarketInstruments",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.unique().max(20),
    }),
    defineField({
      name: "aiTutorEnabled",
      type: "boolean",
      group: "access",
      initialValue: true,
    }),
    defineField({
      name: "seoTitle",
      type: "string",
      group: "seo",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "seoDescription",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: "legacySlug",
      type: "string",
      group: "seo",
      description: "Previous public slug retained for redirect mapping.",
      validation: (rule) => rule.regex(/^[a-z0-9-]+$/),
    }),
  ],
  orderings: [
    {
      title: "Module order",
      name: "moduleOrder",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      lessonType: "lessonType",
      order: "order",
      status: "status",
    },
    prepare: ({ title, lessonType, order, status }) => ({
      title: `${order ?? "?"}. ${title}`,
      subtitle: `${lessonType ?? "lesson"} · ${status ?? "draft"}`,
    }),
  },
});
