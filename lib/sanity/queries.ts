import { defineQuery } from "next-sanity";

const articleCardProjection = `
  _id,
  "language": coalesce(language, "en"),
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
    && coalesce(language, "en") == $locale
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
    && coalesce(language, "en") == $locale
  ] | order(publishedAt desc) [0...$limit] {
    ${articleCardProjection}
  }
`);

export const articleBySlugQuery = defineQuery(`
  *[
    _type == "article" &&
    slug.current == $slug &&
    coalesce(language, "en") == $locale &&
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

export const articleSummaryBySlugQuery = defineQuery(`
  *[
    _type == "article" &&
    slug.current == $slug &&
    coalesce(language, "en") == $locale &&
    defined(publishedAt) &&
    publishedAt <= now()
  ][0] {
    ${articleCardProjection},
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
