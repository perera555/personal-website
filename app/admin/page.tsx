import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { isAdmin } from "@/lib/auth";
import { getContent, getMessages, type Message } from "@/lib/content";
import { deleteMessage, logout, markMessageRead } from "../actions";
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
    <div className="flex-1 bg-background">
      <Suspense fallback={<p className="p-10 text-center text-sm text-muted">Loading…</p>}>
        <AdminGate searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AdminGate({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  if (!(await isAdmin())) return <LoginForm />;

  const { tab, post: postId, created } = await searchParams;
  const [content, messages, posts] = await Promise.all([getContent(), getMessages(), getAllPostsForAdmin()]);
  const unread = messages.filter((m) => !m.read).length;
  const active = tab === "messages" ? "messages" : tab === "blog" ? "blog" : "content";

  let body: React.ReactNode;
  if (active === "content") body = <ContentEditor initial={content} />;
  else if (active === "messages") body = <Messages messages={messages} />;
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
    `rounded-md px-3 py-1.5 text-sm font-medium ${on ? "bg-surface shadow-sm border border-border" : "text-muted hover:text-foreground"}`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <nav className="flex items-center gap-1">
            <Link href="/admin" className={tabClass(active === "content")}>
              Content
            </Link>
            <Link href="/admin?tab=blog" className={tabClass(active === "blog")}>
              Blog
            </Link>
            <Link href="/admin?tab=messages" className={tabClass(active === "messages")}>
              Messages
              {unread > 0 && (
                <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] text-background">{unread}</span>
              )}
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <a href="/" target="_blank" className="text-muted hover:text-foreground">
              View site ↗
            </a>
            <form action={logout}>
              <button className="rounded-md border border-border px-3 py-1.5 hover:bg-surface">Log out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {body}
      </main>
    </>
  );
}

function PostList({ posts }: { posts: Post[] }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blog posts</h1>
          <p className="mt-1 text-sm text-muted">Published posts appear on your homepage and at /blog.</p>
        </div>
        <Link href="/admin?tab=blog&post=new" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background">
          + New post
        </Link>
      </div>
      {posts.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted">
          No posts yet. Click “New post” to write your first one.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
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
      <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
      <ul className="mt-6 space-y-3">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-xl border bg-surface p-5 ${m.read ? "border-border" : "border-accent/50 shadow-sm"}`}
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
