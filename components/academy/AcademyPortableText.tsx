import Image from "next/image";
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextTypeComponentProps,
} from "@portabletext/react";
import { getSanityImageUrl } from "@/lib/sanity/image";
import type { SanityImage } from "@/types/article";

function AcademyPortableImage({
  value,
}: PortableTextTypeComponentProps<SanityImage>) {
  const url = getSanityImageUrl(value, 1400, 840);
  if (!url) return null;
  return (
    <figure>
      <Image
        src={url}
        alt={value.alt || ""}
        width={1400}
        height={840}
        sizes="(max-width: 900px) 100vw, 760px"
      />
    </figure>
  );
}

const components: PortableTextComponents = {
  block: {
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    normal: ({ children }) => <p>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  marks: {
    link: ({ children, value }) => {
      const href =
        typeof value?.href === "string" && value.href.startsWith("https://")
          ? value.href
          : "#";
      return (
        <a href={href} target="_blank" rel="noreferrer noopener">
          {children}
        </a>
      );
    },
  },
  types: { image: AcademyPortableImage },
};

type AcademyPortableTextProps = {
  value: unknown[];
};

export function AcademyPortableText({ value }: AcademyPortableTextProps) {
  if (!value?.length) return null;
  return (
    <div className="academy-portable-text">
      <PortableText value={value} components={components} />
    </div>
  );
}
