import { CheckmarkCircleIcon } from "@sanity/icons/CheckmarkCircle";
import { DocumentIcon } from "@sanity/icons/Document";
import { PlayIcon } from "@sanity/icons/Play";
import { TiersIcon } from "@sanity/icons/Tiers";
import { defineArrayMember, defineField, defineType } from "sanity";

const accessLevels = [
  { title: "Free", value: "free" },
  { title: "Premium", value: "premium" },
];

export const academyVideoType = defineType({
  name: "academyVideo",
  title: "Academy video",
  type: "object",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "provider",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "YouTube", value: "youtube" },
          { title: "Vimeo", value: "vimeo" },
          { title: "Mux", value: "mux" },
          { title: "Cloudflare Stream", value: "cloudflare-stream" },
          { title: "Self-hosted", value: "self-hosted" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "providerVideoId",
      title: "Provider video ID",
      type: "string",
      description:
        "Use the provider's opaque ID. Never paste signing keys or embed HTML.",
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "playbackUrl",
      title: "Public playback URL",
      type: "url",
      description:
        "Only public or server-authorized playback URLs. Private signing is handled outside Sanity.",
      validation: (rule) =>
        rule.uri({ scheme: ["https"] }).custom((value) => {
          if (!value) return true;
          try {
            const hostname = new URL(value).hostname.toLowerCase();
            const allowed = [
              "youtube.com",
              "www.youtube.com",
              "youtu.be",
              "vimeo.com",
              "player.vimeo.com",
              "stream.mux.com",
              "videodelivery.net",
            ];
            return (
              allowed.some(
                (domain) =>
                  hostname === domain || hostname.endsWith(`.${domain}`),
              ) || "Playback host is not allowlisted"
            );
          } catch {
            return "Playback URL is invalid";
          }
        }),
    }),
    defineField({
      name: "posterImage",
      title: "Poster image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.required().max(160),
        }),
      ],
    }),
    defineField({
      name: "durationSeconds",
      type: "number",
      validation: (rule) => rule.required().integer().min(1).max(86_400),
    }),
    defineField({
      name: "accessLevel",
      type: "string",
      initialValue: "free",
      options: { list: accessLevels, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "downloadable",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "captions",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              type: "string",
              validation: (rule) => rule.required().max(80),
            }),
            defineField({
              name: "language",
              type: "string",
              validation: (rule) =>
                rule.required().regex(/^[a-z]{2,3}(-[A-Z]{2})?$/),
            }),
            defineField({
              name: "url",
              type: "url",
              validation: (rule) => rule.required().uri({ scheme: ["https"] }),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "chapters",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (rule) => rule.required().max(120),
            }),
            defineField({
              name: "startSeconds",
              type: "number",
              validation: (rule) => rule.required().integer().min(0),
            }),
          ],
          preview: { select: { title: "title", subtitle: "startSeconds" } },
        }),
      ],
    }),
    defineField({
      name: "transcript",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({ name: "publishedAt", type: "datetime" }),
  ],
});

export const academyResourceType = defineType({
  name: "academyResource",
  title: "Academy resource",
  type: "object",
  icon: DocumentIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: "resourceType",
      type: "string",
      options: {
        list: [
          "pdf-guide",
          "checklist",
          "worksheet",
          "chart-template",
          "glossary",
          "transcript",
          "reference-link",
          "dataset",
          "practice-file",
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "file",
      type: "file",
      description:
        "Allowed: PDF, plain text, CSV, common images, office documents and ZIP practice bundles. Maximum 25 MB.",
      options: {
        accept:
          ".pdf,.txt,.csv,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.zip",
      },
      validation: (rule) =>
        rule.custom((file) => {
          if (!file) return true;
          const asset = (file as { asset?: { _ref?: string } }).asset?._ref;
          if (!asset) return "A valid file asset is required";
          const sizeMatch = asset.match(/-(\d+)-/);
          if (sizeMatch && Number(sizeMatch[1]) > 25 * 1024 * 1024) {
            return "Resources must be 25 MB or smaller";
          }
          return true;
        }),
    }),
    defineField({
      name: "url",
      type: "url",
      description: "Use HTTPS. JavaScript and data URLs are not accepted.",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(400),
    }),
    defineField({
      name: "accessLevel",
      type: "string",
      initialValue: "free",
      options: { list: accessLevels, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "downloadable",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "copyrightNotice",
      type: "string",
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "version",
      type: "number",
      initialValue: 1,
      validation: (rule) => rule.required().integer().min(1),
    }),
  ],
  preview: { select: { title: "title", subtitle: "resourceType" } },
});

export const academyAnswerOptionType = defineType({
  name: "academyAnswerOption",
  title: "Answer option",
  type: "object",
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: "optionId",
      title: "Stable option ID",
      type: "string",
      description: "Immutable within an assessment version, for example a1.",
      validation: (rule) => rule.required().regex(/^[a-zA-Z0-9_-]{1,64}$/),
    }),
    defineField({
      name: "label",
      type: "string",
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: "matchKey",
      type: "string",
      description: "Matching group key; only used for matching questions.",
      validation: (rule) => rule.max(64),
    }),
  ],
  preview: { select: { title: "label", subtitle: "optionId" } },
});

export const academyQuestionType = defineType({
  name: "academyQuestion",
  title: "Assessment question",
  type: "object",
  icon: TiersIcon,
  fields: [
    defineField({
      name: "questionId",
      title: "Stable question ID",
      type: "string",
      validation: (rule) => rule.required().regex(/^[a-zA-Z0-9_-]{1,80}$/),
    }),
    defineField({
      name: "prompt",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(2_000),
    }),
    defineField({
      name: "questionType",
      type: "string",
      options: {
        layout: "radio",
        list: [
          "single-choice",
          "multiple-choice",
          "true-false",
          "numeric",
          "ordering",
          "matching",
          "short-answer",
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answers",
      type: "array",
      of: [defineArrayMember({ type: "academyAnswerOption" })],
      validation: (rule) => rule.unique().max(20),
    }),
    defineField({
      name: "correctOptionIds",
      title: "Correct option IDs (server-only projection)",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      hidden: ({ parent }) =>
        ["numeric", "short-answer"].includes(parent?.questionType),
      validation: (rule) => rule.unique().max(20),
    }),
    defineField({
      name: "numericAnswer",
      type: "number",
      hidden: ({ parent }) => parent?.questionType !== "numeric",
    }),
    defineField({
      name: "numericTolerance",
      type: "number",
      initialValue: 0,
      hidden: ({ parent }) => parent?.questionType !== "numeric",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "explanation",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(2_000),
    }),
    defineField({
      name: "points",
      type: "number",
      initialValue: 1,
      validation: (rule) => rule.required().positive().max(100),
    }),
    defineField({
      name: "partialCredit",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "difficulty",
      type: "string",
      initialValue: "beginner",
      options: { list: ["beginner", "intermediate", "advanced"] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.unique().max(10),
    }),
    defineField({
      name: "sourceLesson",
      type: "reference",
      to: [{ type: "academyLesson" }],
    }),
  ],
  preview: { select: { title: "prompt", subtitle: "questionType" } },
});

export const academyPassingRequirementsType = defineType({
  name: "academyPassingRequirements",
  title: "Passing requirements",
  type: "object",
  fields: [
    defineField({
      name: "requireAllRequiredLessons",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "requireAllRequiredModules",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "finalAssessment",
      type: "reference",
      to: [{ type: "academyAssessment" }],
    }),
    defineField({
      name: "minimumAssessmentPercent",
      type: "number",
      validation: (rule) => rule.min(0).max(100),
    }),
  ],
});
