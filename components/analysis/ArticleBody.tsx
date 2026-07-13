import Image from "next/image";
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextTypeComponentProps,
} from "@portabletext/react";
import { getSanityImageUrl } from "@/lib/sanity/image";
import type { Article, SanityImage } from "@/lib/sanity/types";

function PortableImage({ value }: PortableTextTypeComponentProps<SanityImage>) {
  const imageUrl = getSanityImageUrl(value, 1400, 840);

  if (!imageUrl) {
    return null;
  }

  return (
    <figure className="analysis-body-image">
      <Image
        src={imageUrl}
        alt={value.alt || ""}
        width={1400}
        height={840}
        sizes="(max-width: 900px) 100vw, 760px"
      />
      {value.caption ? <figcaption>{value.caption}</figcaption> : null}
    </figure>
  );
}

const portableTextComponents: PortableTextComponents = {
  types: {
    image: PortableImage,
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const external = href.startsWith("http");

      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer noopener" : undefined}
        >
          {children}
        </a>
      );
    },
  },
};

export function ArticleBody({ body }: Pick<Article, "body">) {
  return (
    <div className="analysis-portable-text">
      <PortableText value={body} components={portableTextComponents} />
    </div>
  );
}
