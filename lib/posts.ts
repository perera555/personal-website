import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";

// Blog posts are stored in content/posts.json (next to site.json).
const DIR = path.join(process.cwd(), "content");
const POSTS_FILE = path.join(DIR, "posts.json");

export const POSTS_TAG = "blog-posts";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // Markdown
  cover: string; // image path in /public or https URL — optional
  tags: string[];
  published: boolean;
  publishedAt: string; // YYYY-MM-DD
  updatedAt: string; // ISO timestamp
};

// Shown until the first post is saved from /admin. Edit or delete it there.
const starterPosts: Post[] = [
  {
    id: "welcome",
    slug: "welcome-to-my-blog",
    title: "Welcome to my blog",
    excerpt: "A new space where I'll share what I learn about IT leadership, systems, and building for the web.",
    body: `After more than 15 years working across banking, IT administration and business operations, I've decided to start writing things down.

## What I'll write about

- Running IT for small and growing businesses
- Lessons from working in a regulated banking environment
- My journey learning modern web development
- Working across Sri Lanka and Australia

> The best way to learn something is to explain it to someone else.

Thanks for reading — feel free to [get in touch](/#contact) if you'd like to talk.`,
    cover: "",
    tags: ["Personal", "IT"],
    published: true,
    publishedAt: "2026-11-06",
    updatedAt: "2026-11-06T00:00:00.000Z",
  },
];

async function readAll(): Promise<Post[]> {
  try {
    const data = JSON.parse(await readFile(POSTS_FILE, "utf-8"));
    return Array.isArray(data) ? data : starterPosts;
  } catch {
    return starterPosts;
  }
}

const byDateDesc = (a: Post, b: Post) => b.publishedAt.localeCompare(a.publishedAt) || b.updatedAt.localeCompare(a.updatedAt);

/** All posts including drafts — for the admin. Not cached. */
export async function getAllPostsForAdmin() {
  return (await readAll()).sort(byDateDesc);
}

/** Published posts only — for the public site. Cached until a post is saved. */
export async function getPublishedPosts(): Promise<Post[]> {
  "use cache";
  cacheLife("max");
  cacheTag(POSTS_TAG);
  return (await readAll()).filter((p) => p.published).sort(byDateDesc);
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheLife("max");
  cacheTag(POSTS_TAG);
  return (await readAll()).find((p) => p.published && p.slug === slug) ?? null;
}

async function writeAll(posts: Post[]) {
  await mkdir(DIR, { recursive: true });
  const tmp = `${POSTS_FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(posts, null, 2), "utf-8");
  await rename(tmp, POSTS_FILE);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Validates and saves a post. Returns the stored post. */
export async function upsertPost(input: Record<string, unknown>, id: string | null, nowIso: string): Promise<Post> {
  const all = await readAll();
  const existing = id ? all.find((p) => p.id === id) : undefined;

  const title = str(input.title, 200);
  let slug = slugify(str(input.slug, 100) || title) || "post";
  // Make the slug unique among other posts.
  const taken = new Set(all.filter((p) => p.id !== existing?.id).map((p) => p.slug));
  for (let n = 2; taken.has(slug); n++) slug = `${slug.replace(/-\d+$/, "")}-${n}`;

  const date = str(input.publishedAt, 10);
  const cover = str(input.cover, 500);

  const post: Post = {
    id: existing?.id ?? crypto.randomUUID(),
    slug,
    title,
    excerpt: str(input.excerpt, 400),
    body: str(input.body, 100_000),
    cover: /^(https:\/\/|\/(?!\/))/i.test(cover) ? cover : "",
    tags: (Array.isArray(input.tags) ? input.tags : [])
      .map((t) => str(t, 40))
      .filter(Boolean)
      .slice(0, 8),
    published: input.published === true,
    publishedAt: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : nowIso.slice(0, 10),
    updatedAt: nowIso,
  };

  await writeAll(existing ? all.map((p) => (p.id === existing.id ? post : p)) : [post, ...all]);
  return post;
}

export async function removePost(id: string) {
  await writeAll((await readAll()).filter((p) => p.id !== id));
}

export function formatDate(ymd: string) {
  const d = new Date(`${ymd}T00:00:00Z`);
  return isNaN(d.getTime())
    ? ymd
    : d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
