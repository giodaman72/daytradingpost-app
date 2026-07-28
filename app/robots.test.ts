import { afterEach, describe, expect, it } from "vitest";
import robots from "./robots";

describe("production robots metadata", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("advertises the canonical sitemap and blocks private surfaces", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/";
    const result = robots();
    expect(result.host).toBe("https://example.com");
    expect(result.sitemap).toBe("https://example.com/sitemap.xml");
    expect(result.rules).toMatchObject({
      allow: "/",
      disallow: expect.arrayContaining([
        "/admin/",
        "/api/",
        "/dashboard/",
        "/studio/",
      ]),
    });
  });
});
