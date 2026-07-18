import { StackCompactIcon } from "@sanity/icons/StackCompact";
import { defineArrayMember, defineField, defineType } from "sanity";

export const academyModuleType = defineType({
  name: "academyModule",
  title: "Course module",
  type: "document",
  icon: StackCompactIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "access", title: "Access and publication" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) => rule.max(500),
    }),
    defineField({
      name: "course",
      type: "reference",
      to: [{ type: "academyCourse" }],
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      type: "number",
      group: "content",
      validation: (rule) => rule.required().integer().min(1).max(1_000),
    }),
    defineField({
      name: "estimatedDurationMinutes",
      type: "number",
      group: "content",
      validation: (rule) => rule.integer().min(1).max(100_000),
    }),
    defineField({
      name: "learningObjectives",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.unique().max(20),
    }),
    defineField({
      name: "lessons",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "academyLesson" }],
        }),
      ],
      validation: (rule) =>
        rule.unique().custom((value, context) => {
          const status = context.document?.status;
          if (status === "published" && (!value || value.length === 0)) {
            return "Published modules require at least one lesson";
          }
          return true;
        }),
    }),
    defineField({
      name: "prerequisiteModules",
      type: "array",
      group: "access",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "academyModule" }],
          options: {
            filter: ({ document }) => ({
              filter: "_id != $id",
              params: { id: document._id.replace(/^drafts\./, "") },
            }),
          },
        }),
      ],
      validation: (rule) => rule.unique().max(20),
    }),
    defineField({
      name: "requiredForCompletion",
      type: "boolean",
      group: "access",
      initialValue: true,
    }),
    defineField({
      name: "accessLevel",
      title: "Access level",
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
    defineField({
      name: "version",
      type: "number",
      group: "access",
      initialValue: 1,
      validation: (rule) => rule.required().integer().min(1),
    }),
  ],
  orderings: [
    {
      title: "Course order",
      name: "courseOrder",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", order: "order", status: "status" },
    prepare: ({ title, order, status }) => ({
      title: `${order ?? "?"}. ${title}`,
      subtitle: status,
    }),
  },
});
