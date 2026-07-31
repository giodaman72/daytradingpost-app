import { describe, expect, it } from "vitest";
import { buildPurchaseConfirmationContent } from "./purchaseConfirmationContent";

describe("buildPurchaseConfirmationContent", () => {
  it("renders monthly purchase details in HTML and plain text", () => {
    const result = buildPurchaseConfirmationContent({
      accountUrl: "https://daytradingpost.com/account/billing",
      buyerName: "Giovanni",
      currentPeriodEnd: "2026-08-30T12:00:00.000Z",
      providerReference: "revolut-123",
      plan: "monthly",
      verifiedAt: "2026-07-30T12:00:00.000Z",
    });

    expect(result.subject).toBe("Payment confirmed — Monthly membership");
    expect(result.text).toContain("Amount: €19.99");
    expect(result.text).toContain("Access through: 30 August 2026");
    expect(result.html).toContain("revolut-123");
    expect(result.html).toContain("https://daytradingpost.com/account/billing");
  });

  it("renders annual pricing and escapes buyer-controlled values", () => {
    const result = buildPurchaseConfirmationContent({
      accountUrl: "https://daytradingpost.com/account/billing",
      buyerName: "<script>alert('x')</script>",
      currentPeriodEnd: null,
      providerReference: "<reference>",
      plan: "annual",
      verifiedAt: "2026-07-30T12:00:00.000Z",
    });

    expect(result.text).toContain("Amount: €49.99");
    expect(result.html).not.toContain("<script>");
    expect(result.html).toContain("&lt;reference&gt;");
    expect(result.text).not.toContain("Access through:");
  });
});
