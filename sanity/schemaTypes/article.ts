import { defineArrayMember, defineField, defineType } from "sanity";

const marketBiasOptions = ["Bullish", "Neutral", "Bearish"] as const;

export const articleType = defineType({
  name: "article",
  title: "Article",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "market", title: "Market data" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().min(8).max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) => rule.required().min(40).max(260),
    }),
    defineField({
      name: "featuredImage",
      title: "Featured image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.required().max(160),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      group: "content",
      to: [{ type: "author" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      group: "content",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "instrumentSymbol",
      title: "Instrument symbol",
      type: "string",
      group: "market",
      description: "Examples: XAU/USD, NAS100, WTI, BTC/USD",
      validation: (rule) => rule.required().uppercase().max(24),
    }),
    defineField({
      name: "marketBias",
      title: "Market bias",
      type: "string",
      group: "market",
      options: {
        list: marketBiasOptions.map((value) => ({ title: value, value })),
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "supportLevels",
      title: "Support levels",
      type: "array",
      group: "market",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1).max(8).unique(),
    }),
    defineField({
      name: "resistanceLevels",
      title: "Resistance levels",
      type: "array",
      group: "market",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1).max(8).unique(),
    }),
    defineField({
      name: "body",
      title: "Body content",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            annotations: [
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (rule) =>
                      rule.uri({ scheme: ["http", "https", "mailto"] }),
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
              title: "Alternative text",
              type: "string",
              validation: (rule) => rule.required().max(160),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
              validation: (rule) => rule.max(200),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "riskFactors",
      title: "Primary risk factors",
      type: "array",
      group: "market",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1).max(10).unique(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      group: "content",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "accessLevel",
      title: "Premium / free status",
      type: "string",
      group: "content",
      initialValue: "free",
      options: {
        list: [
          { title: "Free", value: "free" },
          { title: "Premium", value: "premium" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      group: "seo",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) => rule.max(160),
    }),
  ],
  orderings: [
    {
      title: "Published date, newest",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "instrumentSymbol",
      media: "featuredImage",
      publishedAt: "publishedAt",
    },
    prepare({ title, subtitle, media, publishedAt }) {
      const date = publishedAt
        ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
            new Date(publishedAt),
          )
        : "Unscheduled";

      return {
        title,
        subtitle: `${subtitle || "No symbol"} · ${date}`,
        media,
      };
    },
  },
});
