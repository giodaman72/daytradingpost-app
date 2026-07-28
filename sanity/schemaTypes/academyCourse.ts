import { BookIcon } from "@sanity/icons/Book";
import { defineArrayMember, defineField, defineType } from "sanity";

export const academyCourseType = defineType({
  name: "academyCourse",
  title: "Academy course",
  type: "document",
  icon: BookIcon,
  groups: [
    { name: "content", title: "Course", default: true },
    { name: "curriculum", title: "Curriculum" },
    { name: "access", title: "Access and publication" },
    { name: "seo", title: "SEO and legacy URLs" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().min(4).max(140),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) => rule.required().min(30).max(300),
    }),
    defineField({
      name: "description",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "block" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "coverImage",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          validation: (rule) => rule.required().max(160),
        }),
      ],
    }),
    defineField({
      name: "trailerVideo",
      type: "academyVideo",
      group: "content",
    }),
    defineField({
      name: "instructor",
      type: "reference",
      group: "content",
      to: [{ type: "academyInstructor" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      type: "reference",
      group: "content",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "difficulty",
      type: "string",
      group: "content",
      options: {
        list: ["beginner", "intermediate", "advanced"],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "estimatedDurationMinutes",
      type: "number",
      group: "content",
      validation: (rule) => rule.required().integer().min(1).max(100_000),
    }),
    defineField({
      name: "learningObjectives",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) =>
        rule
          .unique()
          .max(30)
          .custom((value, context) =>
            context.document?.status === "published" &&
            (!value || value.length === 0)
              ? "Published courses require at least one learning objective"
              : true,
          ),
    }),
    defineField({
      name: "targetAudience",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.unique().max(20),
    }),
    defineField({
      name: "prerequisiteCourses",
      type: "array",
      group: "curriculum",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "academyCourse" }],
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
      name: "modules",
      type: "array",
      group: "curriculum",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "academyModule" }],
        }),
      ],
      validation: (rule) =>
        rule
          .unique()
          .custom((value, context) =>
            context.document?.status === "published" &&
            (!value || value.length === 0)
              ? "Published courses require at least one module"
              : true,
          ),
    }),
    defineField({
      name: "tags",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.unique().max(20),
    }),
    defineField({
      name: "featured",
      type: "boolean",
      group: "access",
      initialValue: false,
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
      name: "certificateEnabled",
      type: "boolean",
      group: "access",
      initialValue: false,
    }),
    defineField({
      name: "certificateTemplate",
      type: "reference",
      group: "access",
      to: [{ type: "academyCertificateTemplate" }],
      hidden: ({ document }) => !document?.certificateEnabled,
    }),
    defineField({
      name: "passingRequirements",
      type: "academyPassingRequirements",
      group: "curriculum",
    }),
    defineField({
      name: "version",
      type: "number",
      group: "access",
      initialValue: 1,
      validation: (rule) => rule.required().integer().min(1),
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
      name: "socialImage",
      type: "image",
      group: "seo",
      options: { hotspot: true },
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
      title: "Published date, newest",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "difficulty",
      media: "coverImage",
      status: "status",
      access: "accessLevel",
      version: "version",
    },
    prepare: ({ title, subtitle, media, status, access, version }) => ({
      title,
      subtitle: `${subtitle ?? "Unrated"} · ${access ?? "free"} · ${status ?? "draft"} · v${version ?? 1}`,
      media,
    }),
  },
});
