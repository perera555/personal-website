import Link from "next/link";
import { readingTime } from "@/lib/markdown";
import { formatDate, type Post } from "@/lib/posts";
import { TiltCard } from "./tilt-card";

/** Large card for the newest post. */
export function FeaturedPost({ post }: { post: Post }) {
  return (
    <TiltCard
      as="article"
      max={3}
      className="group grid overflow-hidden rounded-3xl border border-border bg-surface depth md:grid-cols-[1.1fr_1fr]"
    >
      {post.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover} alt="" className="aspect-[16/10] size-full object-cover md:aspect-auto" />
      ) : (
        <div className="relative aspect-[16/10] overflow-hidden bg-linear-to-br from-accent via-accent/80 to-accent/50 md:aspect-auto md:min-h-80">
          <span className="absolute -right-4 -bottom-16 font-display text-[16rem] leading-none font-semibold text-background/15 select-none">
            {post.title.charAt(0)}
          </span>
          <span className="absolute top-6 left-6 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-accent">
            Latest post
          </span>
        </div>
      )}
      <div className="flex flex-col justify-center p-7 sm:p-10">
        <p className="font-mono text-xs text-muted">
          {formatDate(post.publishedAt)} · {readingTime(post.body)} min read
        </p>
        {/* The title link stretches over the whole card (after:inset-0), so clicking anywhere opens the post */}
        <h3 className="mt-4 font-display text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:z-10 group-hover:text-accent">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-4 leading-relaxed text-muted">{post.excerpt}</p>}
        <Link
          href={`/blog/${post.slug}`}
          className="relative z-20 mt-6 inline-flex w-fit items-center gap-1 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background shadow-md transition hover:shadow-lg"
        >
          Read the post <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </TiltCard>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <TiltCard as="article" max={6} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface depth">
      {post.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover} alt="" loading="lazy" className="aspect-video w-full object-cover" />
      ) : (
        <div className="relative aspect-video w-full overflow-hidden bg-linear-to-br from-accent-soft via-surface to-accent-soft">
          <span className="absolute -right-6 -bottom-10 font-display text-[9rem] leading-none font-semibold text-accent/10 select-none">
            {post.title.charAt(0)}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="font-mono text-xs text-muted">
          {formatDate(post.publishedAt)} · {readingTime(post.body)} min read
        </p>
        <h3 className="mt-3 font-display text-xl leading-snug font-semibold tracking-tight">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:z-10 group-hover:text-accent">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>}
        {post.tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
            {post.tags.map((t) => (
              <li key={t} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent">
                {t}
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/blog/${post.slug}`}
          className={`relative z-20 ${post.tags.length > 0 ? "mt-4" : "mt-auto pt-5"} w-fit text-sm font-medium text-accent hover:underline`}
        >
          Read the post →
        </Link>
      </div>
    </TiltCard>
  );
}
