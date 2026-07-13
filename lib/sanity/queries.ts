import { defineQuery } from "next-sanity";

const articleCardProjection = `
  _id,
  title,
  "slug": slug.current,
  "excerpt": coalesce(excerpt, "Market analysis from DayTradingPost."),
  featuredImage {
    _type,
    asset,
    crop,
    hotspot,
    alt
  },
  author-> {
    name,
    role,
    "slug": slug.current
  },
  category-> {
    title,
    description,
    "slug": slug.current
  },
  "instrumentSymbol": coalesce(instrumentSymbol, "MARKET"),
  "marketBias": coalesce(marketBias, "Neutral"),
  publishedAt,
  "accessLevel": coalesce(accessLevel, "free")
`;

export const articlesQuery = defineQuery(`
  *[
    _type == "article" &&
    defined(slug.current) &&
    defined(publishedAt) &&
    publishedAt <= now()
  ] | order(publishedAt desc) {
    ${articleCardProjection}
  }
`);

export const latestArticlesQuery = defineQuery(`
  *[
    _type == "article" &&
    defined(slug.current) &&
    defined(publishedAt) &&
    publishedAt <= now()
  ] | order(publishedAt desc) [0...$limit] {
    ${articleCardProjection}
  }
`);

export const articleBySlugQuery = defineQuery(`
  *[
    _type == "article" &&
    slug.current == $slug &&
    defined(publishedAt) &&
    publishedAt <= now()
  ][0] {
    ${articleCardProjection},
    "body": coalesce(
      body[] {
        ...,
        _type == "image" => {
          asset,
          crop,
          hotspot,
          alt,
          caption
        }
      },
      []
    ),
    "supportLevels": coalesce(supportLevels, []),
    "resistanceLevels": coalesce(resistanceLevels, []),
    "riskFactors": coalesce(riskFactors, []),
    seoTitle,
    seoDescription
  }
`);

export const articleSlugsQuery = defineQuery(`
  *[
    _type == "article" &&
    defined(slug.current) &&
    defined(publishedAt) &&
    publishedAt <= now()
  ] {
    "slug": slug.current
  }
`);
