import type { Platform, SocialPost } from "@/lib/social";

const heights: Record<Platform, number> = {
  youtube: 0, // uses a 16:9 box instead
  instagram: 620,
  facebook: 600,
  linkedin: 560,
};

export const platformLabel: Record<Platform, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
};

/** Shows a Facebook / Instagram / LinkedIn / YouTube post inside the page. */
export function SocialEmbed({ post }: { post: Pick<SocialPost, "platform" | "embedUrl" | "url"> }) {
  const title = `${platformLabel[post.platform]} post`;
  if (post.platform === "youtube") {
    return (
      <iframe
        src={post.embedUrl}
        title={title}
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="aspect-video w-full rounded-xl border-0 bg-black"
      />
    );
  }
  return (
    <iframe
      src={post.embedUrl}
      title={title}
      loading="lazy"
      height={heights[post.platform]}
      allow="encrypted-media; picture-in-picture; web-share"
      className="w-full rounded-xl border-0 bg-white"
      style={{ height: heights[post.platform] }}
    />
  );
}
