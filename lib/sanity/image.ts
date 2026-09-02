import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityDataset, sanityProjectId } from "@/sanity/env";
import type { ArticleSummary, SanityImage } from "@/types/article";

export function getSanityImageUrl(
  image: SanityImage | null | undefined,
  width: number,
  height: number,
) {
  if (!image?.asset?._ref || sanityProjectId === "placeholder") {
    return null;
  }

  const builder = createImageUrlBuilder({
    projectId: sanityProjectId,
    dataset: sanityDataset,
  });

  return builder
    .image(image)
    .auto("format")
    .fit("crop")
    .width(width)
    .height(height)
    .url();
}

export function getArticleImageUrl(
  article: Pick<ArticleSummary, "featuredImage" | "featuredImageUrl">,
  width: number,
  height: number,
) {
  return (
    article.featuredImageUrl ||
    getSanityImageUrl(article.featuredImage, width, height)
  );
}
