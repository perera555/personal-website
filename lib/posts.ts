import { cacheLife, cacheTag } from "next/cache";
import { readStore, writeStore } from "./store";

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

// Shown until the first post is saved from /admin. Edit or delete them there.
const starterPosts: Post[] = [
  {
    id: "learning-web-development",
    slug: "learning-web-development-after-15-years-in-it",
    title: "Learning web development after 15 years in IT",
    excerpt:
      "I've spent my career keeping systems running. In 2025 I decided to learn how to build them — and this website is the result.",
    body: `For most of my career, my job has been to keep technology working for other people. At the Central Bank of Sri Lanka, at USN Packaging Lanka, and now as Director – IT at Gazelle Key International, I've looked after email systems, networks, backups, user access and the day-to-day tools a business depends on.

In 2025 I decided it was time to learn the other side: how modern websites and web applications are actually built.

## Why now?

Every business I've worked with runs on web tools — online platforms, CRM systems, booking and supplier portals. Understanding how they're built makes me better at choosing them, supporting them, and explaining them to the people who use them.

So I went back to studying:

1. **Certificate in Web Development** (January – May 2025)
2. **Advanced Certificate in Web Development** (May – October 2025)

## What surprised me

- **The fundamentals still matter.** HTML, CSS and JavaScript are the base of everything, just like networking basics are for IT administration.
- **Modern frameworks do a lot of work for you.** This site is built with **Next.js** and **Tailwind CSS**. Things that used to take a lot of setup now come almost ready to use.
- **Good habits carry over.** Documentation, testing changes before going live, keeping passwords out of shared code — the same discipline I learned in banking applies to web development.

## Building this website

This site is my first real project. It has my portfolio, this blog, a contact form, and a private admin area where I write posts and update my details without touching the code.

> Building something yourself is the fastest way to understand how it works.

## What's next

I'll keep improving this site and keep writing here about what I learn — both from IT leadership and from building for the web. If you're also changing direction or learning something new later in your career, I'd love to hear from you. [Get in touch](/#contact).`,
    cover: "",
    tags: ["Web Development", "Learning"],
    published: true,
    publishedAt: "2026-11-06",
    updatedAt: "2026-11-06T02:00:00.000Z",
  },
  {
    id: "central-bank-lessons",
    slug: "lessons-from-11-years-at-the-central-bank",
    title: "5 lessons from 11 years at the Central Bank of Sri Lanka",
    excerpt:
      "From 2008 to 2019 I worked in one of the most regulated environments there is. Here's what it taught me about data, documentation and people.",
    body: `I joined the Central Bank of Sri Lanka in March 2008 as a Bank Office Assistant and stayed for eleven years. It was my first long role, and it shaped how I approach every job since — including running IT for a business today.

Here are five lessons I still use every week.

## 1. Accuracy is not optional

In banking, a small data entry mistake doesn't stay small. It flows into reports, decisions and records that other people trust. I learned to treat every entry as if someone senior would rely on it — because they usually did.

## 2. If it isn't documented, it didn't happen

A big part of my work was preparing, verifying and maintaining official documents for supervisory review. Good documentation protects the organisation, the customer and you. Today I apply the same rule to IT: every system change, policy and procedure gets written down.

## 3. Reports should answer a question

I prepared routine and ad-hoc reports for senior officers. The best reports weren't the longest ones — they were the ones that answered the question the reader actually had. Before building any report, ask: *what decision will this help someone make?*

## 4. Systems are only as good as the people using them

I supported the operations of the **Currency Management Module** and trained junior staff on internal banking systems. The software mattered, but what made the biggest difference was people understanding *why* each step existed. Training is not a one-time task — it's part of running any system.

## 5. Compliance is a habit, not a checklist

Working in a regulated environment teaches you to build compliance into daily work instead of rushing it at the end. Later, as Director – IT, the same mindset helped me manage administration, documentation and compliance across travel, import and export operations.

---

Eleven years is a long time in one place, but I'm grateful for it. It gave me a foundation of precision and patience that I've carried into IT administration, business leadership, and now web development.

What did your first long job teach you? I'd be glad to hear — [send me a message](/#contact).`,
    cover: "",
    tags: ["Career", "Banking", "Leadership"],
    published: true,
    publishedAt: "2026-11-06",
    updatedAt: "2026-11-06T01:00:00.000Z",
  },
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
  const data = await readStore<Post[]>("posts");
  return Array.isArray(data) ? data : starterPosts;
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
  await writeStore("posts", posts);
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
