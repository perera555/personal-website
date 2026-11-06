import { cacheLife, cacheTag } from "next/cache";
import { readStore, writeStore } from "./store";

/**
 * Social media on the website:
 * - YouTube: latest videos are fetched automatically from the channel's public feed.
 * - Facebook / Instagram / LinkedIn / single YouTube videos: paste a post link in
 *   /admin → Social and it is shown on the website as an embedded post.
 */

export const SOCIAL_TAG = "social-posts";

export type Platform = "youtube" | "instagram" | "facebook" | "linkedin";

export type SocialPost = {
  id: string;
  platform: Platform;
  url: string; // the original post link
  embedUrl: string; // what the website shows in a frame
  note: string;
  addedAt: string;
};

/* ---------------- Turning a pasted link into an embeddable post ---------------- */

export function parseSocialLink(input: string): Omit<SocialPost, "id" | "note" | "addedAt"> | null {
  let raw = input.trim();
  // LinkedIn's "Embed this post" gives an <iframe> code — take the link out of it.
  const src = raw.match(/src=["']([^"']+)["']/i);
  if (src) raw = src[1];

  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^(www\.|m\.|web\.)/, "");
  const url = u.toString();

  // YouTube video: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
  if (host === "youtube.com" || host === "youtu.be") {
    const id =
      host === "youtu.be"
        ? u.pathname.slice(1)
        : u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1];
    if (id && /^[\w-]{11}$/.test(id)) {
      return { platform: "youtube", url, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` };
    }
    return null;
  }

  // Instagram: instagram.com/p/CODE, /reel/CODE, /tv/CODE
  if (host === "instagram.com") {
    const m = u.pathname.match(/^\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]+)/);
    if (m) return { platform: "instagram", url, embedUrl: `https://www.instagram.com/${m[1]}/${m[2]}/embed/` };
    return null;
  }

  // Facebook: posts, photos, videos, reels, permalink and share links (post must be Public)
  if (host === "facebook.com" || host === "fb.watch") {
    const isVideo = /\/(videos|reel|watch)\b/.test(u.pathname) || host === "fb.watch";
    const plugin = isVideo ? "video.php" : "post.php";
    return {
      platform: "facebook",
      url,
      embedUrl: `https://www.facebook.com/plugins/${plugin}?href=${encodeURIComponent(url)}&show_text=true&width=500`,
    };
  }

  // LinkedIn: linkedin.com/posts/name_activity-1234567890-abcd, /feed/update/urn:li:activity:123, or embed links
  if (host === "linkedin.com") {
    const urn =
      u.pathname.match(/urn:li:(activity|share|ugcPost):(\d+)/) ??
      decodeURIComponent(u.pathname).match(/urn:li:(activity|share|ugcPost):(\d+)/);
    if (urn) {
      return { platform: "linkedin", url, embedUrl: `https://www.linkedin.com/embed/feed/update/urn:li:${urn[1]}:${urn[2]}` };
    }
    const activity = u.pathname.match(/activity-(\d{10,})/);
    if (activity) {
      return { platform: "linkedin", url, embedUrl: `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activity[1]}` };
    }
    return null;
  }

  return null;
}

/* ---------------- Stored posts ---------------- */

async function readAll(): Promise<SocialPost[]> {
  const data = await readStore<SocialPost[]>("social");
  return Array.isArray(data) ? data : [];
}

/** Posts shown on the website. Cached until a post is added or removed. */
export async function getSocialPosts(): Promise<SocialPost[]> {
  "use cache";
  cacheLife("max");
  cacheTag(SOCIAL_TAG);
  return readAll();
}

export async function getSocialPostsForAdmin() {
  return readAll();
}

export async function addSocialPost(post: SocialPost) {
  const all = await readAll();
  await writeStore("social", [post, ...all.filter((p) => p.embedUrl !== post.embedUrl)].slice(0, 100));
}

export async function removeSocialPost(id: string) {
  await writeStore("social", (await readAll()).filter((p) => p.id !== id));
}

/* ---------------- YouTube: automatic latest videos ---------------- */

export type Video = { id: string; title: string; published: string };

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/** Latest videos from a YouTube channel's public feed (no account or key needed). Refreshed hourly. */
export async function getLatestVideos(channelId: string, limit = 3): Promise<Video[]> {
  "use cache";
  cacheLife("hours");
  if (!/^UC[\w-]{22}$/.test(channelId)) return [];
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    if (!res.ok) return [];
    const xml = await res.text();
    return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, limit).flatMap((m) => {
      const id = m[1].match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1];
      const title = m[1].match(/<title>([\s\S]*?)<\/title>/)?.[1];
      const published = m[1].match(/<published>([^<]+)<\/published>/)?.[1] ?? "";
      return id && title ? [{ id, title: decode(title), published }] : [];
    });
  } catch {
    return [];
  }
}
