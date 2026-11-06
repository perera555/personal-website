"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Markdown } from "@/lib/markdown";
import type { Post } from "@/lib/posts";
import { deletePost, savePost, type FormState } from "../actions";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

type Draft = Pick<Post, "title" | "slug" | "excerpt" | "body" | "cover" | "tags" | "published" | "publishedAt">;

const toDraft = (p: Post | null, today: string): Draft => ({
  title: p?.title ?? "",
  slug: p?.slug ?? "",
  excerpt: p?.excerpt ?? "",
  body: p?.body ?? "",
  cover: p?.cover ?? "",
  tags: p?.tags ?? [],
  published: p?.published ?? false,
  publishedAt: p?.publishedAt ?? today,
});

export function PostEditor({ post, today, justCreated }: { post: Post | null; today: string; justCreated: boolean }) {
  const [d, setD] = useState<Draft>(() => toDraft(post, today));
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(toDraft(post, today)));
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [state, formAction, pending] = useActionState<FormState, FormData>(savePost, {});

  // After a successful save, adopt the stored version (e.g. the final slug).
  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (state.saved) {
      const next = toDraft(JSON.parse(state.saved), today);
      setD(next);
      setSavedJson(JSON.stringify(next));
    }
  }

  const json = JSON.stringify(d);
  const dirty = json !== savedJson;
  const set = (patch: Partial<Draft>) => setD({ ...d, ...patch });

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const status = state.error ? (
    <span className="text-red-600">{state.error}</span>
  ) : dirty ? (
    <span className="text-muted">Unsaved changes</span>
  ) : state.ok ? (
    <span className="text-emerald-600">{state.message}</span>
  ) : justCreated ? (
    <span className="text-emerald-600">Post created.</span>
  ) : (
    <span className="text-muted">All changes saved</span>
  );

  return (
    <div className="pb-28">
      <Link href="/admin?tab=blog" className="text-sm text-muted hover:text-foreground">
        ← All posts
      </Link>

      <form action={formAction} className="mt-4 space-y-5">
        <input type="hidden" name="post" value={json} />
        <input type="hidden" name="id" value={post?.id ?? ""} />

        <input
          value={d.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Post title"
          aria-label="Title"
          className="w-full bg-transparent font-display text-3xl font-semibold tracking-tight outline-none placeholder:text-muted/50 sm:text-4xl"
        />
        <textarea
          value={d.excerpt}
          onChange={(e) => set({ excerpt: e.target.value })}
          placeholder="A one or two sentence summary (shown on cards)"
          aria-label="Summary"
          rows={2}
          className={inputClass}
        />

        {/* Write / Preview */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface/90 backdrop-blur depth">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="flex gap-1">
              {(["write", "preview"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-md px-3 py-1 text-sm capitalize ${tab === t ? "bg-accent-soft font-medium text-accent" : "text-muted"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <span className="hidden text-xs text-muted sm:block">
              ## Heading · **bold** · *italic* · [link](https://…) · - list · &gt; quote · ![image](/pic.jpg)
            </span>
          </div>
          {tab === "write" ? (
            <textarea
              value={d.body}
              onChange={(e) => set({ body: e.target.value })}
              rows={18}
              aria-label="Post content"
              placeholder="Write your post here…"
              className="block w-full resize-y bg-surface p-4 font-mono text-sm leading-relaxed outline-none"
            />
          ) : (
            <div className="prose min-h-[18rem] p-6">
              {d.body.trim() ? <Markdown source={d.body} /> : <p className="text-muted">Nothing to preview yet.</p>}
            </div>
          )}
        </div>

        <div className="grid gap-4 rounded-2xl border border-border bg-surface/90 backdrop-blur depth p-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-muted">Web address</span>
            <div className="mt-1 flex items-center rounded-lg border border-border bg-background pl-3 text-sm focus-within:border-accent">
              <span className="text-muted">/blog/</span>
              <input
                value={d.slug}
                onChange={(e) => set({ slug: e.target.value })}
                placeholder="made-from-title"
                className="w-full bg-transparent py-2 pr-3 outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted">Date</span>
            <input
              type="date"
              value={d.publishedAt}
              onChange={(e) => set({ publishedAt: e.target.value })}
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted">Tags (comma separated)</span>
            <input
              value={d.tags.join(",")}
              onChange={(e) => set({ tags: e.target.value.split(",") })}
              placeholder="IT, Leadership"
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted">Cover image (optional)</span>
            <input
              value={d.cover}
              onChange={(e) => set({ cover: e.target.value })}
              placeholder="/blog/cover.jpg or https://…"
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="flex items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={d.published}
              onChange={(e) => set({ published: e.target.checked })}
              className="size-4 accent-[var(--accent)]"
            />
            <span className="text-sm">
              <span className="font-medium">Published</span>{" "}
              <span className="text-muted">— untick to keep it as a private draft</span>
            </span>
          </label>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p className="text-sm" role="status">
              {status}
            </p>
            <div className="flex gap-2">
              {post && !dirty && post.published && (
                <a
                  href={`/blog/${d.slug}`}
                  target="_blank"
                  className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-background"
                >
                  View ↗
                </a>
              )}
              <button
                type="submit"
                disabled={pending || (!dirty && !!post)}
                className="rounded-xl bg-linear-to-br from-accent to-accent/75 shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl px-5 py-2 text-sm font-medium text-background disabled:opacity-40"
              >
                {pending ? "Saving…" : post ? "Save" : "Create post"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {post && (
        <form
          action={deletePost}
          onSubmit={(e) => {
            if (!confirm("Delete this post permanently?")) e.preventDefault();
          }}
          className="mt-8"
        >
          <input type="hidden" name="id" value={post.id} />
          <button className="text-sm text-red-600 hover:underline">Delete this post</button>
        </form>
      )}
    </div>
  );
}
