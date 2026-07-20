"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

export function CertificateShareDialog({
  linkedinUrl,
  verificationUrl,
  xUrl,
}: {
  linkedinUrl: string;
  verificationUrl: string;
  xUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <details className="certificate-share">
      <summary className="button button-secondary">
        <Share2 size={17} aria-hidden="true" />
        Share
      </summary>
      <div className="certificate-share-panel">
        <strong>Share verified completion</strong>
        <p>Only the public verification record is shared.</p>
        <label htmlFor="certificate-verification-link">Verification link</label>
        <div>
          <input
            id="certificate-verification-link"
            readOnly
            value={verificationUrl}
          />
          <button type="button" onClick={copyLink}>
            {copied ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <nav aria-label="Certificate social sharing">
          <a href={linkedinUrl} rel="noreferrer" target="_blank">
            LinkedIn
          </a>
          <a href={xUrl} rel="noreferrer" target="_blank">
            X
          </a>
        </nav>
      </div>
    </details>
  );
}
