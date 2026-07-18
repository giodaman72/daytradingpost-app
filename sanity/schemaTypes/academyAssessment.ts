import { ThListIcon } from "@sanity/icons/ThList";
import { defineArrayMember, defineField, defineType } from "sanity";

export const academyAssessmentType = defineType({
  name: "academyAssessment",
  title: "Academy assessment",
  type: "document",
  icon: ThListIcon,
  groups: [
    { name: "content", title: "Assessment", default: true },
    { name: "rules", title: "Rules and availability" },
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
      name: "assessmentType",
      type: "string",
      group: "content",
      options: {
        list: [
          "lesson-quiz",
          "module-quiz",
          "course-final",
          "practice",
          "diagnostic",
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
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
    }),
    defineField({
      name: "lesson",
      type: "reference",
      group: "content",
      to: [{ type: "academyLesson" }],
    }),
    defineField({
      name: "instructions",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "questions",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "academyQuestion" })],
      validation: (rule) =>
        rule
          .min(1)
          .max(200)
          .custom((questions) => {
            const values = (questions ?? []) as Array<{
              questionId?: string;
              questionType?: string;
              correctOptionIds?: string[];
              numericAnswer?: number;
            }>;
            const ids = values.map((question) => question.questionId);
            if (new Set(ids).size !== ids.length)
              return "Question IDs must be unique";
            for (const question of values) {
              if (
                question.questionType !== "short-answer" &&
                question.questionType !== "numeric" &&
                !question.correctOptionIds?.length
              )
                return `Question ${question.questionId ?? "unknown"} requires a correct answer`;
              if (
                question.questionType === "numeric" &&
                typeof question.numericAnswer !== "number"
              )
                return `Question ${question.questionId ?? "unknown"} requires a numeric answer`;
            }
            return true;
          }),
    }),
    defineField({
      name: "passingScore",
      title: "Passing score (%)",
      type: "number",
      group: "rules",
      initialValue: 70,
      validation: (rule) => rule.required().min(0).max(100),
    }),
    defineField({
      name: "maximumAttempts",
      type: "number",
      group: "rules",
      initialValue: 3,
      validation: (rule) => rule.required().integer().min(1).max(100),
    }),
    defineField({
      name: "timeLimitMinutes",
      type: "number",
      group: "rules",
      validation: (rule) => rule.integer().min(1).max(1_440),
    }),
    defineField({
      name: "randomizeQuestions",
      type: "boolean",
      group: "rules",
      initialValue: false,
    }),
    defineField({
      name: "randomizeAnswers",
      type: "boolean",
      group: "rules",
      initialValue: false,
    }),
    defineField({
      name: "showCorrectAnswers",
      type: "boolean",
      group: "rules",
      initialValue: false,
    }),
    defineField({
      name: "showExplanations",
      type: "boolean",
      group: "rules",
      initialValue: true,
    }),
    defineField({ name: "availableFrom", type: "datetime", group: "rules" }),
    defineField({
      name: "availableUntil",
      type: "datetime",
      group: "rules",
      validation: (rule) =>
        rule.custom((value, context) => {
          const start = context.document?.availableFrom;
          return start &&
            value &&
            new Date(String(value)) <= new Date(String(start))
            ? "Availability end must be after its start"
            : true;
        }),
    }),
    defineField({
      name: "accessLevel",
      type: "string",
      group: "rules",
      initialValue: "free",
      options: { list: ["free", "premium"], layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      type: "string",
      group: "rules",
      initialValue: "draft",
      options: {
        list: ["draft", "review", "scheduled", "published", "archived"],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "version",
      type: "number",
      group: "rules",
      initialValue: 1,
      validation: (rule) => rule.required().integer().min(1),
    }),
  ],
  preview: {
    select: {
      title: "title",
      type: "assessmentType",
      status: "status",
      version: "version",
    },
    prepare: ({ title, type, status, version }) => ({
      title,
      subtitle: `${type ?? "assessment"} · ${status ?? "draft"} · v${version ?? 1}`,
    }),
  },
});
