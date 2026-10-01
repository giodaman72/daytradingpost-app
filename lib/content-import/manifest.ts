export type ArticleContent = {
  _id: string;
  _type: "article";
  language: "en" | "es";
  title: string;
  slug: { _type: "slug"; current: string };
  author: { _type: "reference"; _ref: string };
  category: { _type: "reference"; _ref: string };
  featuredImage: {
    _type: "image";
    alt: string;
    asset?: { _type: "reference"; _ref: string };
  };
  instrumentSymbol: string;
  marketBias: "Bullish" | "Neutral" | "Bearish";
  supportLevels: string[];
  resistanceLevels: string[];
  riskFactors: string[];
  publishedAt: string;
  accessLevel: "free" | "premium";
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  body: Array<{
    _type: "block";
    _key: string;
    style: "normal";
    markDefs: never[];
    children: Array<{
      _type: "span";
      _key: string;
      marks: never[];
      text: string;
    }>;
  }>;
};
export type ImportManifest = {
  version: 1;
  projectId: string;
  dataset: string;
  batch: string;
  images: Array<{
    key: string;
    filename: string;
    sha256: string;
    base64: string;
  }>;
  articles: Array<{
    imageKey: string;
    source: string;
    document: ArticleContent;
  }>;
};

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}

export function matchesPublished(
  expected: ArticleContent,
  actual: Record<string, unknown>,
): boolean {
  return Object.entries(expected).every(
    ([key, value]) => stableJson(value) === stableJson(actual[key]),
  );
}

export function parseManifest(text: string): ImportManifest {
  const data = JSON.parse(text) as ImportManifest;
  const fail = (reason: string): never => {
    throw new Error(`Invalid import: ${reason}`);
  };
  if (
    !data ||
    data.version !== 1 ||
    !/^[a-z0-9-]+$/.test(data.batch) ||
    !data.projectId ||
    !data.dataset
  )
    fail("invalid batch header");
  if (
    !Array.isArray(data.articles) ||
    !data.articles.length ||
    data.articles.length > 200 ||
    !Array.isArray(data.images)
  )
    fail("invalid article/image count");
  const images = new Map(data.images.map((image) => [image.key, image]));
  if (images.size !== data.images.length) fail("duplicate image keys");
  for (const image of data.images)
    if (
      !/^[a-f0-9]{64}$/.test(image.sha256) ||
      !/^[\w.-]+\.png$/.test(image.filename) ||
      !image.base64 ||
      image.base64.length > 15000000
    )
      fail("invalid PNG metadata");
  const ids = new Set<string>();
  const pairs = new Map<string, typeof data.articles>();
  const allowed = new Set([
    "_id",
    "_type",
    "language",
    "title",
    "slug",
    "author",
    "category",
    "featuredImage",
    "instrumentSymbol",
    "marketBias",
    "supportLevels",
    "resistanceLevels",
    "riskFactors",
    "publishedAt",
    "accessLevel",
    "excerpt",
    "seoTitle",
    "seoDescription",
    "body",
  ]);
  for (const item of data.articles) {
    const d = item.document;
    if (
      !d ||
      Object.keys(d).some((key) => !allowed.has(key)) ||
      d._type !== "article" ||
      !["en", "es"].includes(d.language)
    )
      fail("only English/Spanish article documents are accepted");
    if (
      !d._id?.startsWith(`import.${data.batch}.${d.language}.`) ||
      !/^[a-zA-Z0-9_.-]+$/.test(d._id) ||
      ids.has(d._id)
    )
      fail("invalid/duplicate import ID");
    ids.add(d._id);
    if (
      !images.has(item.imageKey) ||
      !item.source ||
      !/^[a-z0-9-]+$/.test(d.slug?.current) ||
      d.slug._type !== "slug"
    )
      fail("missing chart, source or slug");
    if (
      d.featuredImage?._type !== "image" ||
      d.featuredImage.asset ||
      Object.keys(d.featuredImage).some((k) => !["_type", "alt"].includes(k)) ||
      !d.featuredImage.alt
    )
      fail("expected unbound original chart with alt text");
    for (const ref of [d.author, d.category])
      if (
        ref?._type !== "reference" ||
        !ref._ref ||
        ref._ref.startsWith("drafts.") ||
        Object.keys(ref).some((k) => !["_type", "_ref"].includes(k))
      )
        fail("invalid published reference");
    if (
      !Array.isArray(d.body) ||
      !d.body.length ||
      d.body.some(
        (b) =>
          b._type !== "block" ||
          b.style !== "normal" ||
          !b._key ||
          b.markDefs.length ||
          !b.children.length ||
          b.children.some(
            (s) =>
              s._type !== "span" ||
              !s._key ||
              s.marks.length ||
              typeof s.text !== "string",
          ),
      )
    )
      fail("invalid plain Portable Text body");
    if (
      !Number.isFinite(Date.parse(d.publishedAt)) ||
      Date.parse(d.publishedAt) > Date.now()
    )
      fail("invalid/future publication date");
    const group = pairs.get(d.slug.current) ?? [];
    group.push(item);
    pairs.set(d.slug.current, group);
  }
  if (new Set(data.articles.map((a) => a.imageKey)).size !== images.size)
    fail("unused images");
  for (const group of pairs.values()) {
    if (
      group.length !== 2 ||
      new Set(group.map((i) => i.document.language)).size !== 2
    )
      fail("each slug requires one English and one Spanish article");
    const [a, b] = group;
    if (a.imageKey !== b.imageKey || a.source !== b.source)
      fail("translations must share original chart/source");
    for (const field of [
      "publishedAt",
      "instrumentSymbol",
      "marketBias",
      "accessLevel",
      "author",
      "category",
    ] as const)
      if (stableJson(a.document[field]) !== stableJson(b.document[field]))
        fail(`translation changed ${field}`);
    const lines = (d: ArticleContent) =>
      d.body.map((block) => block.children.map((s) => s.text).join(""));
    const en = lines(a.document),
      es = lines(b.document);
    if (en.length !== es.length) fail("translation paragraph count differs");
    for (let i = 0; i < en.length; i++) {
      const tokens = (s: string) =>
        s.match(
          /\$?\d+(?:[.,:]\d+)*|\b(?:NAS100|DJ30|XAGUSD|CL|WTI|COMEX|SL|TP1|TP2|RR|1H|4H)\b/g,
        ) ?? [];
      if (stableJson(tokens(en[i])) !== stableJson(tokens(es[i])))
        fail("translation changed a number, currency or market symbol");
    }
  }
  return data;
}
