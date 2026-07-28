import { describe, expect, it } from "vitest";
import { evaluateProductionReadiness } from "./productionReadiness.mjs";

const validEnvironment = {
  ACADEMY_CERTIFICATE_VERIFICATION_BASE_URL: "https://example.com",
  AI_PROVIDER: "openai",
  ALERT_EMAIL_PROVIDER: "disabled",
  CRON_SECRET: "x".repeat(32),
  ECONOMIC_DATA_PROVIDER: "supabase",
  MARKET_DATA_API_BASE_URL: "https://market.example.com",
  MARKET_DATA_API_KEY: "market-secret",
  MARKET_DATA_PROVIDER: "generic_http",
  NEXT_PUBLIC_REVOLUT_ANNUAL_PAYMENT_LINK: "https://pay.example.com/annual",
  NEXT_PUBLIC_REVOLUT_MONTHLY_PAYMENT_LINK: "https://pay.example.com/monthly",
  NEXT_PUBLIC_SANITY_API_VERSION: "2026-07-13",
  NEXT_PUBLIC_SANITY_DATASET: "production",
  NEXT_PUBLIC_SANITY_PROJECT_ID: "project",
  NEXT_PUBLIC_SITE_URL: "https://example.com",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPPORT_EMAIL: "support@example.com",
  OPENAI_API_KEY: "openai-secret",
  OPENAI_ASSISTANT_MODEL: "model",
  OPENAI_CLASSIFIER_MODEL: "classifier",
  PAYMENT_PROVIDER_MODE: "revolut_payment_links",
  SANITY_API_READ_TOKEN: "sanity-secret",
  SUPABASE_SERVICE_ROLE_KEY: "service-secret",
};

describe("production readiness evaluation", () => {
  it("accepts a complete production configuration", () => {
    const result = evaluateProductionReadiness(validEnvironment);
    expect(result.ready).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toHaveLength(1);
  });

  it("accepts an intentional launch without market-data credentials", () => {
    const result = evaluateProductionReadiness({
      ...validEnvironment,
      MARKET_DATA_API_BASE_URL: "",
      MARKET_DATA_API_KEY: "",
      MARKET_DATA_PROVIDER: "disabled",
    });
    expect(result.ready).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings.join("\n")).toContain(
      "Market-data quotes are disabled",
    );
  });

  it("rejects missing services, insecure URLs, fixtures and weak cron secrets", () => {
    const result = evaluateProductionReadiness({
      ...validEnvironment,
      CRON_SECRET: "short",
      ECONOMIC_DATA_PROVIDER: "development",
      MARKET_DATA_PROVIDER: "development",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000/",
      OPENAI_API_KEY: "",
    });
    expect(result.ready).toBe(false);
    expect(result.errors.join("\n")).toContain("must use HTTPS");
    expect(result.errors.join("\n")).toContain(
      "ECONOMIC_DATA_PROVIDER must be supabase",
    );
    expect(result.errors.join("\n")).toContain(
      "MARKET_DATA_PROVIDER must be disabled or generic_http",
    );
    expect(result.errors.join("\n")).toContain("OPENAI_API_KEY");
    expect(result.errors.join("\n")).toContain("at least 32 characters");
  });
});
