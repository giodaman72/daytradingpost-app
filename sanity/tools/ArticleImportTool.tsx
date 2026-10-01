"use client";

import { useRef, useState } from "react";
import {
  useClient,
  useWorkspace,
  validateDocument,
  type SanityDocument,
} from "sanity";
import {
  matchesPublished,
  parseManifest,
  type ArticleContent,
  type ImportManifest,
} from "@/lib/content-import/manifest";

const digest = async (algorithm: string, bytes: Uint8Array<ArrayBuffer>) =>
  Array.from(new Uint8Array(await crypto.subtle.digest(algorithm, bytes)))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");

export function ArticleImportTool() {
  const client = useClient({ apiVersion: "2026-07-13" });
  const workspace = useWorkspace();
  const lock = useRef(false);
  const [manifest, setManifest] = useState<ImportManifest | null>(null);
  const [documents, setDocuments] = useState<ArticleContent[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    "Select a bilingual article manifest to begin.",
  );
  const [receipt, setReceipt] = useState("");

  async function collisions(docs: ArticleContent[]) {
    const slugs = docs.map((d) => d.slug.current);
    const existing = await client.fetch<Array<Record<string, unknown>>>(
      `*[_type == "article" && slug.current in $slugs]`,
      { slugs },
      { perspective: "raw" },
    );
    for (const d of docs) {
      const conflicts = existing.filter(
        (v) =>
          (v.slug as { current?: string })?.current === d.slug.current &&
          (v.language ?? "en") === d.language,
      );
      if (conflicts.some((v) => v._id !== d._id || !matchesPublished(d, v)))
        throw new Error(
          `An existing article or draft conflicts with ${d.language}/${d.slug.current}. Nothing was overwritten.`,
        );
    }
    const byId = await client.getDocuments(docs.map((d) => d._id));
    byId.forEach((v, i) => {
      if (v && !matchesPublished(docs[i], v))
        throw new Error(`Import ID conflict: ${docs[i]._id}`);
    });
    return docs.filter((_, i) => !byId[i]);
  }

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await action();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Import failed. No success is assumed; validate again before retrying.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function prepare() {
    if (!manifest) return;
    setDocuments([]);
    setReceipt("");
    if (
      manifest.projectId !== workspace.projectId ||
      manifest.dataset !== workspace.dataset
    )
      throw new Error(
        "Manifest targets a different Sanity project or dataset.",
      );
    // Hash every image before any upload occurs.
    const imageBytes = new Map<string, Uint8Array<ArrayBuffer>>();
    for (const image of manifest.images) {
      const bytes = Uint8Array.from(atob(image.base64), (c) => c.charCodeAt(0));
      if (
        bytes.slice(0, 8).join(",") !== "137,80,78,71,13,10,26,10" ||
        (await digest("SHA-256", bytes)) !== image.sha256
      )
        throw new Error(`Original chart hash mismatch: ${image.filename}`);
      imageBytes.set(image.key, bytes);
    }
    const refs = [
      ...new Set(
        manifest.articles.flatMap((a) => [
          a.document.author._ref,
          a.document.category._ref,
        ]),
      ),
    ];
    const references = await client.getDocuments(refs);
    if (references.some((r) => !r))
      throw new Error("An existing author/category reference was not found.");
    for (const a of manifest.articles) {
      if (
        references.find((r) => r?._id === a.document.author._ref)?._type !==
          "author" ||
        references.find((r) => r?._id === a.document.category._ref)?._type !==
          "category"
      )
        throw new Error("Reference type mismatch.");
    }
    const assets = new Map<string, string>();
    for (const [index, image] of manifest.images.entries()) {
      setMessage(
        `Uploading and checking original chart ${index + 1}/${manifest.images.length}…`,
      );
      const bytes = imageBytes.get(image.key)!;
      const asset = await client.assets.upload(
        "image",
        new Blob([bytes], { type: "image/png" }),
        { filename: image.filename },
      );
      if (
        asset.sha1hash !== (await digest("SHA-1", bytes)) ||
        asset.size !== bytes.length
      )
        throw new Error(
          `Uploaded chart verification failed: ${image.filename}`,
        );
      assets.set(image.key, asset._id);
    }
    const docs = manifest.articles.map((a) => ({
      ...a.document,
      featuredImage: {
        ...a.document.featuredImage,
        asset: { _type: "reference" as const, _ref: assets.get(a.imageKey)! },
      },
    }));
    for (const [index, d] of docs.entries()) {
      setMessage(
        `Validating article ${index + 1}/${docs.length} against the current Studio schema…`,
      );
      const errors = (
        await validateDocument({
          document: d as unknown as SanityDocument,
          workspace,
          environment: "studio",
        })
      ).filter((m) => m.level === "error");
      if (errors.length)
        throw new Error(
          `${d.title}: ${errors.map((e) => e.message).join("; ")}`,
        );
    }
    const missing = await collisions(docs);
    setDocuments(docs);
    setMessage(
      `${docs.length} articles validated; ${missing.length} new articles ready to publish. Existing exact matches will be verified and retained.`,
    );
  }

  async function publish() {
    const missing = await collisions(documents);
    setMessage(`Publishing ${missing.length} articles in one transaction…`);
    let transactionId: string | null = null;
    if (missing.length) {
      const transaction = client.transaction();
      for (const d of missing) transaction.create(d);
      transactionId = (await transaction.commit({ visibility: "sync" }))
        .transactionId;
    }
    const readback = await client.getDocuments(documents.map((d) => d._id));
    for (let i = 0; i < documents.length; i++)
      if (!readback[i] || !matchesPublished(documents[i], readback[i]!))
        throw new Error(
          `Published readback mismatch for ${documents[i]._id}. Check the existing documents before retrying.`,
        );
    const result = {
      batch: manifest?.batch,
      projectId: workspace.projectId,
      dataset: workspace.dataset,
      transactionId,
      created: missing.length,
      verified: documents.length,
      english: documents.filter((d) => d.language === "en").length,
      spanish: documents.filter((d) => d.language === "es").length,
      verifiedAt: new Date().toISOString(),
      articles: documents.map((d) => ({
        id: d._id,
        language: d.language,
        slug: d.slug.current,
        image: d.featuredImage.asset?._ref,
      })),
    };
    setReceipt(JSON.stringify(result, null, 2));
    setMessage(
      `Publication verified: ${result.english} English and ${result.spanish} Spanish articles. ${missing.length} created in this run.`,
    );
  }

  return (
    <div
      style={{
        padding: 28,
        overflow: "auto",
        height: "100%",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <h1>Import bilingual market reports</h1>
      <p>
        Upload original charts, validate both languages, then publish the
        reviewed batch. Existing articles are never overwritten.
      </p>
      <label htmlFor="article-manifest">Article manifest (JSON)</label>{" "}
      <input
        id="article-manifest"
        type="file"
        accept="application/json,.json"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          setManifest(null);
          setDocuments([]);
          setReceipt("");
          if (!file) return;
          try {
            if (file.size > 30000000)
              throw new Error("Manifest exceeds 30 MB.");
            const value = parseManifest(await file.text());
            setManifest(value);
            setMessage(
              `${value.articles.length} articles and ${value.images.length} original charts loaded. Review the list before validating.`,
            );
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : "Invalid manifest.",
            );
          }
        }}
      />
      <p role="status" aria-live="polite">
        {message}
      </p>
      <div style={{ display: "flex", gap: 16, margin: "20px 0" }}>
        <button disabled={!manifest || busy} onClick={() => void run(prepare)}>
          Upload charts and validate
        </button>
        <button
          disabled={!documents.length || busy || !!receipt}
          onClick={() => void run(publish)}
        >
          Publish validated articles
        </button>
      </div>
      {manifest && (
        <table style={{ width: "100%", textAlign: "left" }}>
          <thead>
            <tr>
              <th>Language</th>
              <th>Article</th>
              <th>Date</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            {manifest.articles.map((a) => (
              <tr key={a.document._id}>
                <td>{a.document.language}</td>
                <td>{a.document.title}</td>
                <td>{a.document.publishedAt.slice(0, 10)}</td>
                <td>{a.document.accessLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {receipt && (
        <>
          <h2>Verified publication receipt</h2>
          <textarea
            aria-label="Publication receipt"
            readOnly
            value={receipt}
            rows={16}
            style={{ width: "100%" }}
          />
        </>
      )}
    </div>
  );
}
