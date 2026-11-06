import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { getSiteUrl } from "@/lib/site-url";

// Lists every public page so Google can find them. Served at /sitemap.xml
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const posts = await getPublishedPosts();
  const latest = posts[0]?.updatedAt;

  return [
    { url: base, lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
