import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// Tells search engines what to index. Served at /robots.txt
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
