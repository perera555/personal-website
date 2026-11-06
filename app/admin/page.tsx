import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { isAdmin } from "@/lib/auth";
import { getContent, getMessages, type Message } from "@/lib/content";
import { platformLabel, SocialEmbed } from "@/components/social-embed";
import { TiltCard } from "@/components/tilt-card";
import { getSocialPostsForAdmin, type SocialPost } from "@/lib/social";
import { deleteMessage, deleteSocialLink, logout, markMessageRead } from "../actions";
import { AddSocialForm } from "./social-form";
import { formatDate, getAllPostsForAdmin, type Post } from "@/lib/posts";
import { ContentEditor } from "./content-editor";
import { LoginForm } from "./login-form";
import { PostEditor } from "./post-editor";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="relative flex-1 overflow-hidden bg-background">
      {/* Glowing 3D background */}
      <div aria-hidden className="glow -top-40 -left-40 size-[34rem] opacity-60" />
      <div aria-hidden className="glow top-1/3 -right-48 size-[30rem] opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_60%)]"
      />
      <Suspense fallback={<p className="relative p-10 text-center text-sm text-muted">Loading…</p>}>
        <AdminGate searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AdminGate({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  if (!(await isAdmin())) return <LoginForm />;

  const { tab, post: postId, created } = await searchParams;
  const [content, messages, posts, social] = await Promise.all([
    getContent(),
    getMessages(),
    getAllPostsForAdmin(),
    getSocialPostsForAdmin(),
  ]);
  const unread = messages.filter((m) => !m.read).length;
  const active =
    tab === "messages" ? "messages" : tab === "blog" ? "blog" : tab === "social" ? "social" : "content";

  let body: React.ReactNode;
  if (active === "content") body = <ContentEditor initial={content} />;
  else if (active === "messages") body = <Messages messages={messages} />;
  else if (active === "social") body = <SocialAdmin posts={social} hasYouTube={!!content.profile.youtubeChannelId} />;
  else if (typeof postId === "string") {
    const post = postId === "new" ? null : (posts.find((p) => p.id === postId) ?? null);
    body =
      postId !== "new" && !post ? (
        <p className="text-muted">That post no longer exists.</p>
      ) : (
        <PostEditor
          key={postId}
          post={post}
          today={new Date().toISOString().slice(0, 10)}
          justCreated={created === "1"}
        />
      );
  } else body = <PostList posts={posts} />;

  const tabClass = (on: boolean) =>
    `whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
      on
        ? "bg-linear-to-br from-accent to-accent/75 text-background shadow-md shadow-accent/30"
        : "text-muted hover:bg-surface hover:text-foreground"
    }`;

  const published = posts.filter((p) => p.published).length;
  const tiles = [
    { label: "Published posts", value: published, href: "/admin?tab=blog", icon: "✎" },
    { label: "Drafts", value: posts.length - published, href: "/admin?tab=blog", icon: "◔" },
    { label: "Unread messages", value: unread, href: "/admin?tab=messages", icon: "✉" },
    { label: "Social posts", value: social.length, href: "/admin?tab=social", icon: "◎" },
  ];

  return (
    <div className="relative">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-accent to-accent/60 text-sm font-semibold text-background shadow-lg shadow-accent/30">
              {content.profile.initials}
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">Admin</span>
              <span className="block text-[11px] text-muted">{content.profile.shortName}</span>
            </span>
          </Link>
          <nav className="order-last flex w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-surface/70 p-1 shadow-sm sm:order-none sm:w-auto">
            <Link href="/admin" className={tabClass(active === "content")}>
              Content
            </Link>
            <Link href="/admin?tab=blog" className={tabClass(active === "blog")}>
              Blog
            </Link>
            <Link href="/admin?tab=social" className={tabClass(active === "social")}>
              Social
            </Link>
            <Link href="/admin?tab=messages" className={tabClass(active === "messages")}>
              Messages
              {unread > 0 && (
                <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">{unread}</span>
              )}
            </Link>
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <a
              href="/"
              target="_blank"
              className="rounded-full border border-border bg-surface px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              View site ↗
            </a>
            <form action={logout}>
              <button className="rounded-full px-3 py-1.5 text-muted transition hover:bg-surface hover:text-foreground">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* 3D dashboard tiles */}
        <div className="rise mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {tiles.map((t) => (
            <TiltCard key={t.label} max={12} className="rounded-2xl border border-border bg-surface/90 backdrop-blur depth">
              <Link href={t.href} className="block p-4 sm:p-5">
                <span className="pop flex items-center justify-between">
                  <span className="font-display text-3xl font-semibold tracking-tight text-accent sm:text-4xl">
                    {t.value}
                  </span>
                  <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-lg text-accent shadow-inner">
                    {t.icon}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-muted">{t.label}</span>
              </Link>
            </TiltCard>
          ))}
        </div>
        <div className="mx-auto max-w-4xl">{body}</div>
      </main>
    </div>
  );
}

function SocialAdmin({ posts, hasYouTube }: { posts: SocialPost[]; hasYouTube: boolean }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Social media posts</h1>
        <p className="mt-1 text-sm text-muted">
          Paste the link of a Facebook, Instagram, LinkedIn or YouTube post. It appears in the “Social” section of your
          homepage.
        </p>
      </div>

      <AddSocialForm />

      <details className="rounded-2xl border border-border bg-surface/90 backdrop-blur depth p-5 text-sm">
        <summary className="cursor-pointer font-medium">How do I copy a post link?</summary>
        <ul className="mt-3 space-y-2 text-muted">
          <li>
            <b className="text-foreground">Facebook:</b> on your post, click <b>Share → Copy link</b>. The post must be set
            to <b>Public</b> (globe icon), or it won&apos;t show.
          </li>
          <li>
            <b className="text-foreground">Instagram:</b> on your post, tap <b>⋯</b> (or the paper plane) → <b>Copy link</b>.
            Your account must be public.
          </li>
          <li>
            <b className="text-foreground">LinkedIn:</b> on your post, click <b>⋯ → Copy link to post</b>. Or use{" "}
            <b>⋯ → Embed this post</b> and paste the code.
          </li>
          <li>
            <b className="text-foreground">YouTube:</b> click <b>Share → Copy</b> under a video.
          </li>
        </ul>
      </details>

      <div
        className={`rounded-2xl border p-5 text-sm ${hasYouTube ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-surface"}`}
      >
        <p className="font-medium">
          {hasYouTube ? "✓ YouTube is automatic" : "Make YouTube automatic"}
        </p>
        <p className="mt-1 text-muted">
          {hasYouTube
            ? "Your 3 newest YouTube videos appear on your homepage by themselves (checked every hour)."
            : "Add your YouTube channel ID in the Content tab → Contact & links. Then your newest videos appear on your homepage by themselves."}
        </p>
      </div>

      <div>
        <h2 className="font-semibold">On your website ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
            Nothing added yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {posts.map((p) => (
              <li key={p.id} className="rounded-2xl border border-border bg-surface/90 backdrop-blur depth p-3">
                <div className="mb-3 flex items-center justify-between gap-2 px-1 text-xs">
                  <span className="font-medium">
                    {platformLabel[p.platform]}
                    {p.note && <span className="font-normal text-muted"> · {p.note}</span>}
                  </span>
                  <form action={deleteSocialLink}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="rounded-md border border-border px-2 py-1 text-red-600 hover:bg-background">
                      Remove
                    </button>
                  </form>
                </div>
                <SocialEmbed post={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PostList({ posts }: { posts: Post[] }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Blog posts</h1>
          <p className="mt-1 text-sm text-muted">Published posts appear on your homepage and at /blog.</p>
        </div>
        <Link href="/admin?tab=blog&post=new" className="rounded-xl bg-linear-to-br from-accent to-accent/75 shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl px-4 py-2 text-sm font-medium text-background">
          + New post
        </Link>
      </div>
      {posts.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted">
          No posts yet. Click “New post” to write your first one.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/90 backdrop-blur depth">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin?tab=blog&post=${p.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-background"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.title || "(untitled)"}</span>
                  <span className="font-mono text-xs text-muted">
                    {formatDate(p.publishedAt)} · /blog/{p.slug}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    p.published ? "bg-emerald-500/15 text-emerald-600" : "bg-border text-muted"
                  }`}
                >
                  {p.published ? "Published" : "Draft"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Messages({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <h1 className="font-semibold">No messages yet</h1>
        <p className="mt-2 text-sm text-muted">When someone uses the contact form on your website, it shows up here.</p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Messages</h1>
      <ul className="mt-6 space-y-3">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-2xl border bg-surface/90 p-5 backdrop-blur depth ${m.read ? "border-border" : "border-accent/50 shadow-sm"}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">
                {!m.read && <span className="mr-2 inline-block size-2 rounded-full bg-accent" aria-label="Unread" />}
                {m.name}{" "}
                <a href={`mailto:${m.email}`} className="text-sm font-normal text-accent hover:underline">
                  {m.email}
                </a>
              </p>
              <time className="font-mono text-xs text-muted" dateTime={m.createdAt}>
                {new Date(m.createdAt).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}
              </time>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
            <div className="mt-4 flex gap-2 text-xs">
              <a
                href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}
                className="rounded-md bg-accent px-3 py-1.5 font-medium text-background"
              >
                Reply by email
              </a>
              <form action={markMessageRead}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="read" value={String(!m.read)} />
                <button className="rounded-md border border-border px-3 py-1.5 hover:bg-background">
                  Mark as {m.read ? "unread" : "read"}
                </button>
              </form>
              <form action={deleteMessage}>
                <input type="hidden" name="id" value={m.id} />
                <button className="rounded-md border border-border px-3 py-1.5 text-red-600 hover:bg-background">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
