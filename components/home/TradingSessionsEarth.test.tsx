import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TradingSessionsEarth } from "./TradingSessionsEarth";

describe("TradingSessionsEarth", () => {
  it("shows a clean globe and the four global trading sessions in English", () => {
    const { container } = render(<TradingSessionsEarth locale="en" />);
    const card = container.querySelector("figcaption");

    expect(card).not.toBeNull();
    expect(container.querySelector(".session-earth-route")).toBeNull();
    expect(container.querySelector(".session-earth-marker-anchor")).toBeNull();
    expect(
      container.querySelectorAll(".session-earth-hours > div"),
    ).toHaveLength(4);
    expect(
      container.querySelector(".session-earth-canvas"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Earth",
      }),
    ).toBeInTheDocument();
    expect(within(card!).getByText("Sydney · Australia")).toBeInTheDocument();
    expect(within(card!).getByText("Tokyo · Asia")).toBeInTheDocument();
    expect(within(card!).getByText("London")).toBeInTheDocument();
    expect(within(card!).getByText("New York · USA")).toBeInTheDocument();
  });

  it("localizes the added sessions in Spanish", () => {
    const { container } = render(<TradingSessionsEarth locale="es" />);
    const card = container.querySelector("figcaption");

    expect(card).not.toBeNull();
    expect(within(card!).getByText("Sídney · Australia")).toBeInTheDocument();
    expect(within(card!).getByText("Tokio · Asia")).toBeInTheDocument();
    expect(within(card!).getByText("Hora de Sídney")).toBeInTheDocument();
    expect(within(card!).getByText("Hora de Tokio")).toBeInTheDocument();
  });
});
