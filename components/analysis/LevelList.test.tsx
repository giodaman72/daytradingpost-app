import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LevelList } from "./LevelList";

describe("LevelList", () => {
  it("renders an accessible heading and numbered market levels", () => {
    render(
      <LevelList label="Support" levels={["2,380", "2,360"]} tone="support" />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Support" }),
    ).toBeInTheDocument();

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Level 12,380");
    expect(items[1]).toHaveTextContent("Level 22,360");
  });
});
