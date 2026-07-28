import { parseVerificationCode } from "../academyValidation";

export function buildCertificateVerificationUrl(
  baseUrl: string,
  verificationCode: string,
) {
  const normalizedBaseUrl = new URL(baseUrl);
  normalizedBaseUrl.pathname = `/verify/certificate/${encodeURIComponent(
    parseVerificationCode(verificationCode),
  )}`;
  normalizedBaseUrl.search = "";
  normalizedBaseUrl.hash = "";
  return normalizedBaseUrl.toString();
}

export function buildCertificateShareLinks(verificationUrl: string) {
  const verifiedUrl = new URL(verificationUrl);
  if (!["http:", "https:"].includes(verifiedUrl.protocol))
    throw new Error("Certificate sharing requires an HTTP verification URL.");
  const encodedUrl = encodeURIComponent(verifiedUrl.toString());
  const text = encodeURIComponent(
    "Verify my DayTradingPost Academy course completion certificate.",
  );
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://x.com/intent/post?url=${encodedUrl}&text=${text}`,
  };
}
