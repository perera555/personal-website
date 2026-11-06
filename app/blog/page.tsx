import type { Metadata } from "next";
import { FeaturedPost, PostCard } from "@/components/post-card";
import { Container, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getContent } from "@/lib/content";
import { getPublishedPosts } from "@/lib/posts";

// Title shown in Google, e.g. "Dhanushka Perera Blog — Stories, thoughts and updates"
export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();
  const blogName = `${profile.shortName || profile.name} Blog`;
  return {
    title: { absolute: `${blogName} — Stories, thoughts and updates` },
    description: `The blog of ${profile.name}: stories, thoughts and updates on technology, work, travel and life.`,
    alternates: { canonical: "/blog" },
    openGraph: { title: blogName, type: "website", url: "/blog" },
  };
}

export default async function BlogPage() {
  const [c, posts] = await Promise.all([getContent(), getPublishedPosts()]);
  const [featured, ...rest] = posts;
  return (
    <>
      <SiteHeader c={c} />
      <main className="relative flex-1 overflow-hidden">
        <div aria-hidden className="glow -top-48 left-1/3 size-[30rem] opacity-50" />
        <Container className="relative py-16 sm:py-24">
          <div className="rise max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Blog · {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
              {c.profile.shortName || c.profile.name}&apos;s Blog
            </h1>
            <p className="mt-4 text-lg text-muted">
              Stories, thoughts and updates — on technology, work, travel and life. By {c.profile.name}.
            </p>
          </div>

          {!featured ? (
            <p className="mt-16 rounded-2xl border border-dashed border-border p-10 text-center text-muted">
              No posts yet — check back soon.
            </p>
          ) : (
            <>
              <div className="mt-14">
                <FeaturedPost post={featured} />
              </div>
              {rest.length > 0 && (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              )}
            </>
          )}
        </Container>
      </main>
      <SiteFooter c={c} />
    </>
  );
}
