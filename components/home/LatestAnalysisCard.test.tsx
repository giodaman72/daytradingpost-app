import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ForexSessionsPanel } from "./ForexSessions";
import {
  keyLevelRows,
  LatestAnalysisCard,
  type LatestAnalysis,
} from "./LatestAnalysisCard";

const article: LatestAnalysis = {
  _id: "a1",
  accessLevel: "free",
  author: null,
  category: { title: "Crude Oil Analysis" },
  excerpt: "Crude holds above 100 with buyers defending the 4H trend.",
  featuredImage: null,
  featuredImageUrl: "https://cdn.sanity.io/images/p/d/chart.png",
  instrumentSymbol: "WTI",
  marketBias: "Bullish",
  publishedAt: "2026-10-20T12:00:00.000Z",
  slug: "wti-4h-trade-setup-2026-10-20",
  title: "WTI 4H Trade Setup — October 20, 2026",
  resistanceLevels: ["101.31", "102.25", "103.00"],
  supportLevels: ["99.69", "98.91"],
};

describe("keyLevelRows", () => {
  it("orders levels R2, R1, S1, S2 and ignores extras", () => {
    expect(keyLevelRows(article).map((row) => row.label)).toEqual([
      "R2",
      "R1",
      "S1",
      "S2",
    ]);
    expect(keyLevelRows(article)[0]).toMatchObject({
      value: "102.25",
      side: "resistance",
    });
  });

  it("returns nothing when the article has no levels", () => {
    expect(
      keyLevelRows({ ...article, resistanceLevels: [], supportLevels: [] }),
    ).toEqual([]);
  });
});

describe("LatestAnalysisCard", () => {
  it("shows the newest analysis with bias, levels and a read link", () => {
    render(<LatestAnalysisCard article={article} locale="en" />);

    expect(screen.getByText("Latest analysis")).toBeInTheDocument();
    expect(screen.getByText("Bias: Bullish")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: article.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      expect.stringContaining("chart.png"),
    );

    const levels = screen.getByLabelText("Key levels");
    expect(within(levels).getByText("R1").nextSibling).toHaveTextContent(
      "101.31",
    );
    expect(within(levels).getByText("S2").nextSibling).toHaveTextContent(
      "98.91",
    );

    expect(
      screen.getByRole("link", { name: /Read the analysis/ }),
    ).toHaveAttribute("href", "/analysis/wti-4h-trade-setup-2026-10-20");
    expect(screen.getByRole("link", { name: "All analysis" })).toHaveAttribute(
      "href",
      "/analysis",
    );
  });

  it("localizes copy and links in Spanish", () => {
    render(<LatestAnalysisCard article={article} locale="es" />);

    expect(screen.getByText("Último análisis")).toBeInTheDocument();
    expect(screen.getByText("Sesgo: Alcista")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Leer el análisis/ }),
    ).toHaveAttribute("href", "/es/analysis/wti-4h-trade-setup-2026-10-20");
  });

  it("falls back to the excerpt when there are no levels", () => {
    render(
      <LatestAnalysisCard
        article={{ ...article, resistanceLevels: undefined, supportLevels: [] }}
        locale="en"
      />,
    );

    expect(screen.queryByLabelText("Key levels")).toBeNull();
    expect(screen.getByText(article.excerpt)).toBeInTheDocument();
  });
});

describe("ForexSessionsPanel", () => {
  it("lists the four sessions without the globe", () => {
    const { container } = render(<ForexSessionsPanel locale="en" />);

    expect(
      screen.getByRole("complementary", { name: "Forex sessions" }),
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll(".session-earth-hours > div"),
    ).toHaveLength(4);
    expect(container.querySelector(".reference-globe-image")).toBeNull();
  });
});
