import { describe, it, expect } from "vitest";
import {
  parseManifest,
  matchesPublished,
  type ImportManifest,
  type ArticleContent,
} from "./manifest";

function fixture(): ImportManifest {
  const document: ArticleContent = {
    _id: "import.test.en.nas100",
    _type: "article",
    language: "en",
    title: "NAS100 market report",
    slug: { _type: "slug", current: "nas100" },
    author: { _type: "reference", _ref: "author" },
    category: { _type: "reference", _ref: "category" },
    featuredImage: { _type: "image", alt: "NAS100 original chart" },
    instrumentSymbol: "NAS100",
    marketBias: "Neutral",
    supportLevels: ["See chart"],
    resistanceLevels: ["See chart"],
    riskFactors: ["Fed"],
    publishedAt: "2026-09-01T12:00:00Z",
    accessLevel: "free",
    excerpt: "A complete market analysis with the original levels.",
    seoTitle: "NAS100",
    seoDescription: "Market analysis",
    body: [
      {
        _type: "block",
        _key: "p0",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "s0",
            marks: [],
            text: "NAS100 Entry: 30,629 SL: 30.650 TP1: $30,572",
          },
        ],
      },
    ],
  };
  const spanish = JSON.parse(JSON.stringify(document)) as ArticleContent;
  spanish._id = "import.test.es.nas100";
  spanish.language = "es";
  spanish.body[0].children[0].text =
    "NAS100 Entrada: 30,629 SL: 30.650 TP1: $30,572";
  return {
    version: 1,
    projectId: "project",
    dataset: "production",
    batch: "test",
    images: [
      {
        key: "chart",
        filename: "chart.png",
        sha256: "a".repeat(64),
        base64: "cG5n",
      },
    ],
    articles: [
      { imageKey: "chart", source: "report.docx", document },
      { imageKey: "chart", source: "report.docx", document: spanish },
    ],
  };
}
describe("bilingual import guards", () => {
  it("accepts distinct language records with the same slug and unchanged levels", () =>
    expect(parseManifest(JSON.stringify(fixture())).articles).toHaveLength(2));
  it.each([
    "NAS100 Entrada: 30.629 SL: 30.650 TP1: $30,572",
    "NAS100 Entrada: 30,629 SL: 30.650 TP1: 30,572",
    "DJ30 Entrada: 30,629 SL: 30.650 TP1: $30,572",
  ])("rejects altered numbers, currency or symbols: %s", (text) => {
    const f = fixture();
    f.articles[1].document.body[0].children[0].text = text;
    expect(() => parseManifest(JSON.stringify(f))).toThrow(
      "number, currency or market symbol",
    );
  });
  it("rejects a missing translation", () => {
    const f = fixture();
    f.articles.pop();
    expect(() => parseManifest(JSON.stringify(f))).toThrow(
      "one English and one Spanish",
    );
  });
  it("rejects duplicate document IDs", () => {
    const f = fixture();
    f.articles.push(f.articles[0]);
    expect(() => parseManifest(JSON.stringify(f))).toThrow(
      "duplicate import ID",
    );
  });
  it("rejects changes to access or author between translations", () => {
    const f = fixture();
    f.articles[1].document.accessLevel = "premium";
    expect(() => parseManifest(JSON.stringify(f))).toThrow("accessLevel");
  });
  it("rejects a substituted translation chart", () => {
    const f = fixture();
    f.images.push({ ...f.images[0], key: "other" });
    f.articles[1].imageKey = "other";
    expect(() => parseManifest(JSON.stringify(f))).toThrow(
      "share original chart/source",
    );
  });
  it("rejects non-article documents and unsupported write fields", () => {
    const f = fixture();
    Object.assign(f.articles[0].document, { _type: "author" });
    expect(() => parseManifest(JSON.stringify(f))).toThrow(
      "only English/Spanish",
    );
  });
  it("detects changed published content while ignoring Sanity system revisions", () => {
    const d = fixture().articles[0].document;
    expect(matchesPublished(d, { ...d, _rev: "revision" })).toBe(true);
    expect(matchesPublished(d, { ...d, accessLevel: "premium" })).toBe(false);
  });
});
