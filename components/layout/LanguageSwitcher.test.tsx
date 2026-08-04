import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageSwitcher } from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("names the English destination in Spanish on Spanish pages", () => {
    render(<LanguageSwitcher locale="es" pathname="/es/account" />);

    const link = screen.getByRole("link", {
      name: "Ver esta página en inglés",
    });
    expect(link).toHaveTextContent("Inglés");
    expect(link).toHaveAttribute("href", "/account");
  });

  it("names the Spanish destination in Spanish on English pages", () => {
    render(<LanguageSwitcher locale="en" pathname="/account" />);

    const link = screen.getByRole("link", {
      name: "Ver esta página en español",
    });
    expect(link).toHaveTextContent("Español");
    expect(link).toHaveAttribute("href", "/es/account");
  });
});
