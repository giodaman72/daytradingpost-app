import { evaluate, parse } from "groq-js";
import { describe, expect, it } from "vitest";
import * as queries from "./queries";

// Every exported GROQ query must parse; a syntax error makes the site
// silently fall back to empty content instead of failing loudly.
describe("Sanity GROQ queries", () => {
  const entries = Object.entries(queries).filter(
    ([, value]) => typeof value === "string",
  ) as Array<[string, string]>;

  it("exports queries to check", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)("%s parses", (_name, query) => {
    // Sample values let the parser resolve parameterized slices like [0...$limit].
    const params = { limit: 3, locale: "en", slug: "example" };
    expect(() => parse(query, { params })).not.toThrow();
  });
});

describe("latestDailyVideoQuery", () => {
  const dataset = [
    {
      _id: "v-en-new",
      _type: "dailyVideo",
      language: "en",
      title: "EN newest",
      youtubeUrl: "https://youtu.be/aaaaaaaaaaa",
      publishedAt: "2026-10-21T11:30:00.000Z",
    },
    {
      _id: "v-es-old",
      _type: "dailyVideo",
      language: "es",
      title: "ES older",
      youtubeUrl: "https://youtu.be/bbbbbbbbbbb",
      publishedAt: "2026-10-20T11:30:00.000Z",
    },
    {
      _id: "v-future",
      _type: "dailyVideo",
      language: "en",
      title: "Scheduled",
      youtubeUrl: "https://youtu.be/ccccccccccc",
      publishedAt: "2999-01-01T00:00:00.000Z",
    },
  ];

  async function run(locale: string, docs = dataset) {
    const tree = parse(queries.latestDailyVideoQuery, { params: { locale } });
    const value = await evaluate(tree, { dataset: docs, params: { locale } });
    return (await value.get()) as { _id: string } | null;
  }

  it("prefers a video in the page's language", async () => {
    expect((await run("es"))?._id).toBe("v-es-old");
  });

  it("otherwise returns the newest published video", async () => {
    expect((await run("en"))?._id).toBe("v-en-new");
    expect((await run("es", [dataset[0], dataset[2]]))?._id).toBe("v-en-new");
  });

  it("ignores videos scheduled for the future", async () => {
    expect(await run("en", [dataset[2]])).toBeNull();
  });
});
