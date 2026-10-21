import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DailyVideo } from "@/types/video";
import { DailyVideoCard } from "./DailyVideoCard";

const video: DailyVideo = {
  _id: "v1",
  language: "en",
  title: "US Pre-Market: Oil Breaks $100",
  episode: 7,
  youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
  publishedAt: "2026-10-20T13:00:00.000Z",
  summary: "Eight markets and one game plan for the session.",
  thumbnail: null,
  relatedArticle: { slug: "wti-4h-trade-setup-2026-10-20", language: "en" },
};

describe("DailyVideoCard", () => {
  it("shows the poster first and loads the player on play", () => {
    const { container } = render(<DailyVideoCard video={video} locale="en" />);

    expect(screen.getByText("Daily video")).toBeInTheDocument();
    expect(screen.getByText("EP 07")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: video.title }),
    ).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      expect.stringContaining("dQw4w9WgXcQ"),
    );

    fireEvent.click(
      screen.getByRole("button", { name: `Play video: ${video.title}` }),
    );

    const frame = container.querySelector("iframe");
    expect(frame).not.toBeNull();
    expect(frame?.getAttribute("src")).toContain(
      "youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("links to the related analysis and to YouTube", () => {
    render(<DailyVideoCard video={video} locale="en" />);

    expect(
      screen.getByRole("link", { name: /Read the analysis/ }),
    ).toHaveAttribute("href", "/analysis/wti-4h-trade-setup-2026-10-20");
    expect(
      screen.getByRole("link", { name: /Watch on YouTube/ }),
    ).toHaveAttribute("href", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });

  it("localizes copy in Spanish and hides missing extras", () => {
    render(
      <DailyVideoCard
        video={{ ...video, episode: null, relatedArticle: null }}
        locale="es"
      />,
    );

    expect(screen.getByText("Video diario")).toBeInTheDocument();
    expect(screen.queryByText(/^EP /)).toBeNull();
    expect(screen.queryByRole("link", { name: /Leer el análisis/ })).toBeNull();
    expect(
      screen.getByRole("button", { name: /Reproducir video/ }),
    ).toBeInTheDocument();
  });

  it("renders nothing for a link that is not a YouTube video", () => {
    const { container } = render(
      <DailyVideoCard
        video={{ ...video, youtubeUrl: "https://vimeo.com/123456" }}
        locale="en"
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
