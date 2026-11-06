import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/components/og-card";
import { getContent } from "@/lib/content";
import { formatDate, getPublishedPost } from "@/lib/posts";

// The picture shown when a blog post is shared (used when the post has no cover image).
export const alt = "Blog post";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ profile }, post] = await Promise.all([getContent(), getPublishedPost(slug)]);
  return new ImageResponse(
    (
      <OgCard
        kicker={`${profile.shortName || profile.name} · Blog`}
        title={post?.title ?? "Blog"}
        subtitle={post?.excerpt}
        initials={profile.initials}
        footer={post ? `${formatDate(post.publishedAt)}  ·  ${profile.name}` : profile.name}
      />
    ),
    size,
  );
}
