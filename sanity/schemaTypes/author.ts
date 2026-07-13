import { defineField, defineType } from "sanity";

export const authorType = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().min(2).max(80),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      initialValue: "Market analyst",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "bio",
      title: "Biography",
      type: "text",
      rows: 4,
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: "image",
      title: "Profile image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.max(140),
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "image" },
  },
});
