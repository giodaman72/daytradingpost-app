import { BillIcon } from "@sanity/icons/Bill";
import { defineField, defineType } from "sanity";

export const academyCertificateTemplateType = defineType({
  name: "academyCertificateTemplate",
  title: "Academy certificate template",
  type: "document",
  icon: BillIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "statement",
      type: "text",
      rows: 3,
      description:
        "Educational completion statement only. Do not claim accreditation without legal approval.",
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: "version",
      type: "number",
      initialValue: 1,
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({ name: "active", type: "boolean", initialValue: true }),
  ],
  preview: { select: { title: "title", subtitle: "statement" } },
});
