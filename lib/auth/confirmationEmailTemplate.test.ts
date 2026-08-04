import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const template = readFileSync(
  join(process.cwd(), "supabase/templates/confirmation.html"),
  "utf8",
);
const subject = readFileSync(
  join(process.cwd(), "supabase/templates/confirmation-subject.txt"),
  "utf8",
);

describe("Supabase confirmation email template", () => {
  it("selects Spanish copy from signup language metadata", () => {
    expect(subject).toContain('{{ if eq .Data.language "es" }}');
    expect(subject).toContain("Confirma tu correo electrónico");
    expect(template).toContain('{{ if eq .Data.language "es" }}');
    expect(template).toContain("Gracias por crear tu cuenta.");
  });

  it("uses scanner-safe localized token links", () => {
    expect(template).toContain(
      "/es/auth/verify?token_hash={{ .TokenHash }}&amp;type=email",
    );
    expect(template).toContain(
      "/auth/verify?token_hash={{ .TokenHash }}&amp;type=email",
    );
    expect(template).not.toContain(".ConfirmationURL");
  });
});
