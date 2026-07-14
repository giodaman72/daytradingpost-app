import type { PortableTextBlock } from "@portabletext/react";
import type { MarketBias } from "./market";

export type ArticleAccessLevel = "free" | "premium";

export type SanityImage = {
  _key?: string;
  _type: "image";
  alt?: string;
  asset?: {
    _ref?: string;
    _type?: "reference";
  };
  caption?: string;
  crop?: {
    _type?: "sanity.imageCrop";
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
  hotspot?: {
    _type?: "sanity.imageHotspot";
    height: number;
    width: number;
    x: number;
    y: number;
  };
};

export type ArticleAuthor = {
  name: string;
  role?: string;
  slug?: string;
};

export type ArticleCategory = {
  description?: string;
  slug?: string;
  title: string;
};

export type ArticleSummary = {
  _id: string;
  accessLevel: ArticleAccessLevel;
  author: ArticleAuthor | null;
  category: ArticleCategory | null;
  excerpt: string;
  featuredImage: SanityImage | null;
  instrumentSymbol: string;
  marketBias: MarketBias;
  publishedAt: string;
  seoDescription?: string;
  seoTitle?: string;
  slug: string;
  title: string;
};

export type Article = ArticleSummary & {
  body: Array<PortableTextBlock | SanityImage>;
  resistanceLevels: string[];
  riskFactors: string[];
  supportLevels: string[];
};
