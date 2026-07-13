export const sanityApiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-13";

export const sanityDataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const sanityProjectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";

export const isSanityConfigured = Boolean(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    process.env.NEXT_PUBLIC_SANITY_DATASET,
);
