import { describe, expect, it } from "vitest";
import {
  translateInstrumentName,
  translateSpanishPortableText,
  translateSpanishText,
} from "./spanish";

describe("Spanish public content localization", () => {
  it("localizes published article titles, summaries, and market instruments", () => {
    expect(translateSpanishText("Silver 4H Trade Setup — August 4, 2026")).toBe(
      "Configuración de trading de la plata en 4H — 4 de agosto de 2026",
    );
    expect(translateSpanishText("Entry: $58.400")).toBe("Entrada: $58.400");
    expect(translateInstrumentName("WTI Crude Oil")).toBe("Petróleo crudo WTI");
  });

  it("localizes text spans inside portable article content", () => {
    const translated = translateSpanishPortableText([
      {
        _key: "block-1",
        _type: "block",
        children: [
          {
            _key: "span-1",
            _type: "span",
            marks: [],
            text: "Market context",
          },
        ],
        markDefs: [],
        style: "normal",
      },
    ]);

    expect(
      "children" in translated[0] && translated[0].children?.[0],
    ).toMatchObject({ text: "Contexto de mercado" });
  });
});
