import { UserIcon } from "@sanity/icons/User";
import { defineArrayMember, defineField, defineType } from "sanity";

export const instructorType = defineType({
  name: "academyInstructor",
  title: "Academy instructor",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required().min(2).max(100),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "professionalTitle",
      type: "string",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "biography",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "profileImage",
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
    defineField({
      name: "expertise",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.unique().max(20),
    }),
    defineField({
      name: "credentials",
      type: "array",
      description:
        "Enter only credentials that DayTradingPost has independently verified.",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.unique().max(20),
    }),
    defineField({
      name: "socialLinks",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              type: "string",
              validation: (rule) => rule.required().max(40),
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
    defineField({ name: "featured", type: "boolean", initialValue: false }),
    defineField({ name: "active", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "professionalTitle",
      media: "profileImage",
    },
  },
});
