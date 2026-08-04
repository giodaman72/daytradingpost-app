import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDisplayLabel,
  formatLocalizedDisplayLabel,
} from "./formatters";

describe("display formatters", () => {
  it("preserves the existing English display labels", () => {
    expect(formatDisplayLabel("payment_link")).toBe("Payment Link");
    expect(formatLocalizedDisplayLabel("free")).toBe("Free");
  });

  it("translates account membership values into Spanish", () => {
    expect(formatLocalizedDisplayLabel("free", { locale: "es" })).toBe(
      "Gratis",
    );
    expect(formatLocalizedDisplayLabel("active", { locale: "es" })).toBe(
      "Activa",
    );
    expect(formatLocalizedDisplayLabel("pending", { locale: "es" })).toBe(
      "Pendiente",
    );
    expect(formatLocalizedDisplayLabel("annual", { locale: "es" })).toBe(
      "Anual",
    );
  });

  it("uses Spanish fallbacks and dates for the account page", () => {
    expect(formatLocalizedDisplayLabel(null, { locale: "es" })).toBe(
      "No disponible",
    );
    expect(formatDate(null, { locale: "es-ES" })).toBe("No configurado");
    expect(
      formatDate("2026-08-04T00:00:00.000Z", { locale: "es-ES" }),
    ).toContain("2026");
    expect(
      formatDate("2026-08-04T00:00:00.000Z", { locale: "es-ES" }),
    ).not.toContain("Aug");
  });
});
