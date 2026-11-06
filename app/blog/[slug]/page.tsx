import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostCard } from "@/components/post-card";
import { ShareButtons } from "@/components/share-buttons";
import { Container, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getContent } from "@/lib/content";
import { Markdown, readingTime } from "@/lib/markdown";
import { formatDate, getPublishedPost, getPublishedPosts } from "@/lib/posts";
import { getSiteUrl, jsonLd } from "@/lib/site-url";

// Prerender existing posts at build time; new posts are generated on first visit.
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  // Cache Components needs at least one entry, even when there are no posts yet.
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug);
  if (!post) return { title: "Post not found" };
  const { profile } = await getContent();
  return {
    title: post.title,
    description: post.excerpt,
    keywords: [...post.tags, profile.name, `${profile.shortName} blog`],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [profile.name],
      tags: post.tags,
      ...(post.cover ? { images: [post.cover] } : {}),
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const c = await getContent();
  return (
    <>
      <SiteHeader c={c} />
      <main className="relative flex-1 overflow-hidden">
        <div aria-hidden className="glow -top-48 left-1/4 size-[30rem] opacity-40" />
        <Suspense fallback={<Container className="py-24 text-center text-muted">Loading…</Container>}>
          <Article params={params} author={c.profile.name} initials={c.profile.initials} />
        </Suspense>
      </main>
      <SiteFooter c={c} />
    </>
  );
}

async function Article({
  params,
  author,
  initials,
}: Pick<PageProps<"/blog/[slug]">, "params"> & { author: string; initials: string }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const url = getSiteUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: `${url}/blog/${post.slug}`,
    mainEntityOfPage: `${url}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    keywords: post.tags.join(", "),
    image: post.cover ? (post.cover.startsWith("http") ? post.cover : `${url}${post.cover}`) : `${url}/blog/${post.slug}/opengraph-image`,
    author: { "@type": "Person", "@id": `${url}/#person`, name: author, url },
    isPartOf: { "@id": `${url}/blog#blog` },
  };

  return (
    <article className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <Container className="max-w-3xl py-14 sm:py-20">
        <Link href="/blog" className="text-sm text-muted hover:text-accent">
          ← All posts
        </Link>
        <header className="rise mt-8">
          {post.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <li key={t} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                  {t}
                </li>
              ))}
            </ul>
          )}
          <h1 className="mt-4 font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-4 text-lg text-muted">{post.excerpt}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-accent text-xs font-semibold text-background">
                {initials}
              </span>
              <div>
                <p className="font-medium">{author}</p>
                <p className="text-xs text-muted">
                  {formatDate(post.publishedAt)} · {readingTime(post.body)} min read
                </p>
              </div>
            </div>
            <ShareButtons title={post.title} compact />
          </div>
        </header>

        {post.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover} alt="" className="mt-10 aspect-video w-full rounded-2xl border border-border object-cover depth" />
        )}

        <div className="prose mt-10">
          <Markdown source={post.body} />
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-surface p-6 depth sm:p-8">
          <p className="font-display text-xl font-semibold">Enjoyed this post? Share it.</p>
          <p className="mt-1 text-sm text-muted">
            Know someone who&apos;d find it useful? Send it their way — or{" "}
            <Link href="/#contact" className="text-accent hover:underline">
              get in touch
            </Link>
            .
          </p>
          <div className="mt-5">
            <ShareButtons
              title={post.title}
              imageUrl={`/blog/${post.slug}/opengraph-image`}
              imageName={`${post.slug}.png`}
            />
          </div>
        </div>
      </Container>

      <MorePosts currentId={post.id} />
    </article>
  );
}

async function MorePosts({ currentId }: { currentId: string }) {
  const others = (await getPublishedPosts()).filter((p) => p.id !== currentId).slice(0, 3);
  if (others.length === 0) return null;
  return (
    <section className="border-t border-border py-16">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">More posts</h2>
          <Link href="/blog" className="text-sm font-medium text-accent hover:underline">
            All posts →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {others.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}
