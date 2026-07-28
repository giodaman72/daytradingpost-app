import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getPublicSiteUrl();
  return {
    host: siteUrl,
    rules: {
      allow: "/",
      disallow: [
        "/account/",
        "/admin/",
        "/api/",
        "/assistant/",
        "/dashboard/",
        "/instructor/",
        "/membership/",
        "/studio/",
      ],
      userAgent: "*",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
