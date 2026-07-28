import { randomBytes } from "node:crypto";

export function createCertificateNumber(now = new Date()) {
  const year = now.getUTCFullYear();
  return `DTP-${year}-${randomBytes(6).toString("hex").toUpperCase()}`;
}

export function createCertificateVerificationCode() {
  return randomBytes(32).toString("base64url");
}
