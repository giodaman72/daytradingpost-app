import { describe, expect, it } from "vitest";
import { parseYouTubeId, youTubeEmbedUrl } from "./youtube";

describe("parseYouTubeId", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s", "dQw4w9WgXcQ"],
    ["https://m.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?si=abc", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/live/dQw4w9WgXcQ?feature=share", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("reads %s", (url, id) => {
    expect(parseYouTubeId(url)).toBe(id);
  });

  it.each([
    "",
    "not a url",
    "https://vimeo.com/123456789",
    "https://www.youtube.com/watch?v=short",
    "https://evil.example/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/channel/UC1234567890",
    "javascript:alert(1)",
  ])("rejects %s", (url) => {
    expect(parseYouTubeId(url)).toBeNull();
  });
});

it("builds a privacy-enhanced autoplay embed", () => {
  expect(youTubeEmbedUrl("dQw4w9WgXcQ")).toMatch(
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?autoplay=1/,
  );
});
