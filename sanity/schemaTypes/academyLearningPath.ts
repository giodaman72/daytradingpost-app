import { TransferIcon } from "@sanity/icons/Transfer";
import { defineArrayMember, defineField, defineType } from "sanity";

export const academyLearningPathType = defineType({
  name: "academyLearningPath",
  title: "Academy learning path",
  type: "document",
  icon: TransferIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "coverImage",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "targetAudience",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.unique().max(20),
    }),
    defineField({
      name: "difficulty",
      type: "string",
      options: { list: ["beginner", "intermediate", "advanced"] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "estimatedDurationMinutes",
      type: "number",
      validation: (rule) => rule.required().integer().min(1).max(250_000),
    }),
    defineField({
      name: "courses",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "course",
              type: "reference",
              to: [{ type: "academyCourse" }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "required",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: { title: "course.title", required: "required" },
            prepare: ({ title, required }) => ({
              title,
              subtitle: required ? "Required" : "Optional",
            }),
          },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .max(50)
          .custom((items) => {
            const references = (items ?? []).map(
              (item) =>
                (
                  item as {
                    course?: { _ref?: string };
                  }
                ).course?._ref,
            );
            return new Set(references).size === references.length
              ? true
              : "Courses cannot be duplicated";
          }),
    }),
    defineField({
      name: "prerequisiteLearningPaths",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "academyLearningPath" }],
          options: {
            filter: ({ document }) => ({
              filter: "_id != $id",
              params: { id: document._id.replace(/^drafts\./, "") },
            }),
          },
        }),
      ],
      validation: (rule) => rule.unique().max(10),
    }),
    defineField({
      name: "accessLevel",
      type: "string",
      initialValue: "free",
      options: { list: ["free", "premium"], layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
    defineField({
      name: "status",
      type: "string",
      initialValue: "draft",
      options: {
        list: ["draft", "review", "scheduled", "published", "archived"],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({
      name: "version",
      type: "number",
      initialValue: 1,
      validation: (rule) => rule.required().integer().min(1),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "difficulty",
      media: "coverImage",
      status: "status",
    },
    prepare: ({ title, subtitle, media, status }) => ({
      title,
      subtitle: `${subtitle ?? "Unrated"} · ${status ?? "draft"}`,
      media,
    }),
  },
});
