import Image from "next/image";
import Link from "next/link";
import { Container, SiteFooter, SiteHeader, socialLinks } from "@/components/site-chrome";
import { FeaturedPost, PostCard } from "@/components/post-card";
import { TiltCard } from "@/components/tilt-card";
import { getContent } from "@/lib/content";
import type { SiteContent } from "@/lib/default-content";
import { getPublishedPosts, type Post } from "@/lib/posts";
import { getSiteUrl, jsonLd, nameVariants } from "@/lib/site-url";
import { ContactForm } from "./contact-form";

type C = { c: SiteContent };

export default async function Home() {
  const [c, posts] = await Promise.all([getContent(), getPublishedPosts()]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(personSchema(c))} />
      <SiteHeader c={c} />
      <main className="flex-1">
        <Hero c={c} />
        {posts.length > 0 && <LatestPosts posts={posts} />}
        <About c={c} />
        {c.experience.length > 0 && <Experience c={c} />}
        {(c.degrees.length > 0 || c.certifications.length > 0) && <Education c={c} />}
        {c.skillGroups.length > 0 && <Skills c={c} />}
        <Contact c={c} />
      </main>
      <SiteFooter c={c} />
    </>
  );
}

/* ---------- Google structured data: who this website is about ---------- */

function personSchema(c: SiteContent) {
  const url = getSiteUrl();
  const p = c.profile;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${url}/#person`,
        name: p.name,
        alternateName: nameVariants(p.name, p.shortName).slice(1),
        url,
        image: p.photo ? `${url}${p.photo}` : `${url}/opengraph-image`,
        jobTitle: p.role,
        worksFor: p.company ? { "@type": "Organization", name: p.company } : undefined,
        description: p.tagline,
        email: p.email ? `mailto:${p.email}` : undefined,
        // Links Google uses to connect your social profiles to your name
        sameAs: socialLinks(p).map((l) => l.href),
        homeLocation: p.locations.map((l) => ({ "@type": "Place", name: l })),
        alumniOf: c.degrees.map((d) => ({ "@type": "EducationalOrganization", name: d.school })),
        knowsLanguage: c.languages.map((l) => l.name),
        knowsAbout: c.skillGroups.flatMap((g) => g.skills).slice(0, 20),
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: `${p.name} — Personal Website & Blog`,
        alternateName: nameVariants(p.name, p.shortName).map((n) => `${n} Blog`),
        author: { "@id": `${url}/#person` },
      },
      {
        "@type": "Blog",
        "@id": `${url}/blog#blog`,
        url: `${url}/blog`,
        name: `${p.shortName || p.name} Blog`,
        author: { "@id": `${url}/#person` },
      },
    ],
  };
}

/* ---------- Building blocks ---------- */

function Section({
  id,
  index,
  eyebrow,
  title,
  action,
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative py-20 sm:py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              <span className="text-muted">{index} —</span> {eyebrow}
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              {title}
            </h2>
          </div>
          {action}
        </div>
        <div className="mt-12">{children}</div>
      </Container>
    </section>
  );
}

function SideHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-muted">{children}</h3>;
}

/* ---------- Hero with 3D cube ---------- */

function Hero({ c }: C) {
  const p = c.profile;
  const secondary =
    "rounded-full border border-border bg-surface/80 px-5 py-3 text-sm font-medium backdrop-blur transition hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-md";
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden className="glow -top-40 -left-32 size-[32rem]" />
      <div aria-hidden className="glow top-20 -right-40 size-[28rem] opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
      />
      <Container className="relative pt-16 pb-20 sm:pt-24 sm:pb-24">
        <div className="grid items-center gap-16 md:grid-cols-[1.4fr_1fr]">
          <div className="rise">
            {(p.availability || p.locations.length > 0) && (
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs text-muted shadow-sm backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                {[p.availability, p.locations.join(" / ")].filter(Boolean).join(" · ")}
              </p>
            )}
            <h1 className="mt-6 font-display text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-7xl">
              {p.name}
            </h1>
            <p className="mt-5 text-lg font-medium text-accent sm:text-xl">
              {[p.role, p.company].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{p.tagline}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-background shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
              >
                Read my blog →
              </Link>
              <Link href="/#contact" className={secondary}>
                Contact me
              </Link>
              {p.linkedin && (
                <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className={secondary}>
                  LinkedIn ↗
                </a>
              )}
              {p.cvFile && (
                <a href={p.cvFile} download className={secondary}>
                  Download CV
                </a>
              )}
            </div>
          </div>

          <Cube c={c} />
        </div>

        {c.stats.length > 0 && (
          <dl className="rise mt-20 grid grid-cols-2 gap-4 [animation-delay:150ms] sm:grid-cols-4">
            {c.stats.map((s, i) => (
              <TiltCard key={i} max={10} className="flex flex-col-reverse rounded-2xl border border-border bg-surface p-5 depth sm:p-6">
                <dt className="mt-1 text-xs text-muted">{s.label}</dt>
                <dd className="pop font-display text-3xl font-semibold tracking-tight text-accent sm:text-4xl">{s.value}</dd>
              </TiltCard>
            ))}
          </dl>
        )}
      </Container>
    </section>
  );
}

function Cube({ c }: C) {
  const p = c.profile;
  const words = [
    ...c.skillGroups.map((g) => g.name),
    "IT", "Data", "Ops", "Web",
  ].slice(0, 4);
  return (
    <div aria-hidden className="scene float relative mx-auto grid size-72 place-items-center sm:size-80">
      <div className="orbit" />
      <div className="cube">
        <div className="cube-face">
          {p.photo ? (
            <Image src={p.photo} alt="" width={288} height={288} priority className="size-full object-cover" />
          ) : (
            <span className="font-display text-6xl font-semibold text-accent">{p.initials}</span>
          )}
        </div>
        {words.map((w, i) => (
          <div key={i} className="cube-face">
            <span className="px-3 text-center font-display text-lg leading-tight font-semibold text-accent">{w}</span>
          </div>
        ))}
        <div className="cube-face">
          <span className="font-mono text-xs text-muted">{p.role}</span>
        </div>
      </div>
      <div className="absolute -bottom-6 h-6 w-40 rounded-[100%] bg-foreground/15 blur-xl" />
    </div>
  );
}

/* ---------- Sections ---------- */

function About({ c }: C) {
  return (
    <Section id="about" index="02" eyebrow="About" title={c.about.heading}>
      <div className="grid gap-12 md:grid-cols-[1fr_17rem]">
        <div className="space-y-5 text-base leading-relaxed text-muted sm:text-lg">
          {c.about.paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "text-foreground first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-none first-letter:font-semibold first-letter:text-accent" : ""}>
              {p}
            </p>
          ))}
        </div>
        <TiltCard max={5} className="h-fit space-y-8 rounded-2xl border border-border bg-surface p-6 text-sm depth">
          {c.languages.length > 0 && (
            <div>
              <SideHeading>Languages</SideHeading>
              <ul className="mt-3 space-y-1.5">
                {c.languages.map((l, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{l.name}</span>
                    <span className="text-muted">{l.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {c.profile.locations.length > 0 && (
            <div>
              <SideHeading>Based in</SideHeading>
              <ul className="mt-3 space-y-1.5">
                {c.profile.locations.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          )}
          {c.countriesVisited.length > 0 && (
            <div>
              <SideHeading>Countries visited · {c.countriesVisited.length}</SideHeading>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {c.countriesVisited.map((x, i) => (
                  <li key={i} className="rounded-md border border-border px-2 py-0.5 text-xs text-muted">
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TiltCard>
      </div>
    </Section>
  );
}

function Experience({ c }: C) {
  return (
    <Section id="experience" index="03" eyebrow="Experience" title="Where I've worked">
      <ol className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-linear-to-b before:from-accent before:via-border before:to-transparent">
        {c.experience.map((job, i) => (
          <li key={i} className="relative pl-10">
            <span className="absolute top-7 left-0 size-[15px] rounded-full border-[3px] border-background bg-accent shadow-[0_0_0_4px_var(--accent-soft)]" />
            <TiltCard max={3} className="rounded-2xl border border-border bg-surface p-6 depth">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <h3 className="font-display text-xl font-semibold tracking-tight">{job.title}</h3>
                <p className="shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[11px] text-accent">
                  {job.period}
                </p>
              </div>
              <p className="mt-1 text-sm font-medium text-accent">
                {job.company}
                {job.location && <span className="font-normal text-muted"> · {job.location}</span>}
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted sm:text-[15px]">
                {job.points.map((pt, j) => (
                  <li key={j} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-accent/60" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </TiltCard>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Education({ c }: C) {
  return (
    <Section id="education" index="04" eyebrow="Education" title="Qualifications">
      {c.degrees.length > 0 && (
        <div className="mb-14 grid gap-5 md:grid-cols-3">
          {c.degrees.map((d, i) => (
            <TiltCard
              key={i}
              as="article"
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 depth"
            >
              <span aria-hidden className="absolute -top-px left-6 h-1 w-12 rounded-b bg-accent" />
              <p className="font-mono text-xs text-muted">{d.period}</p>
              <h3 className="pop mt-3 font-display text-lg leading-snug font-semibold tracking-tight">{d.title}</h3>
              <p className="mt-auto pt-5 text-sm text-accent">{d.school}</p>
            </TiltCard>
          ))}
        </div>
      )}

      {c.certifications.length > 0 && (
        <>
          <SideHeading>Diplomas &amp; certificates</SideHeading>
          <ul className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {c.certifications.map((cert, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 bg-surface px-5 py-4 text-sm">
                <span>
                  <span className="font-medium">{cert.title}</span>
                  {cert.org && <span className="block text-xs text-muted">{cert.org}</span>}
                </span>
                <span className="shrink-0 font-mono text-xs text-muted">{cert.year}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {c.educationNote && <p className="mt-4 text-sm text-muted">{c.educationNote}</p>}
    </Section>
  );
}

function Skills({ c }: C) {
  return (
    <Section id="skills" index="05" eyebrow="Skills" title="What I bring">
      <div className="grid gap-5 sm:grid-cols-2">
        {c.skillGroups.map((g, i) => (
          <TiltCard key={i} className="rounded-2xl border border-border bg-surface p-6 depth">
            <div className="pop flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-accent font-mono text-xs text-background shadow-md">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-lg font-semibold tracking-tight">{g.name}</h3>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2">
              {g.skills.map((s, j) => (
                <li key={j} className="rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
                  {s}
                </li>
              ))}
            </ul>
          </TiltCard>
        ))}
      </div>
    </Section>
  );
}

function LatestPosts({ posts }: { posts: Post[] }) {
  const [featured, ...rest] = posts;
  return (
    <Section
      id="blog"
      index="01"
      eyebrow="Latest updates"
      title="From the blog"
      action={
        <Link
          href="/blog"
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-accent shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          All posts ({posts.length}) →
        </Link>
      }
    >
      <FeaturedPost post={featured} />
      {rest.length > 0 && (
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {rest.slice(0, 3).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </Section>
  );
}

function Contact({ c }: C) {
  const p = c.profile;
  return (
    <section id="contact" className="py-20 sm:py-28">
      <Container>
        <div className="relative grid gap-10 overflow-hidden rounded-3xl bg-foreground px-6 py-12 text-background shadow-2xl sm:px-12 sm:py-16 lg:grid-cols-[1fr_1.2fr]">
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-accent opacity-30 blur-3xl" />
          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">06 — Contact</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              {c.contact.heading}
            </h2>
            <p className="mt-4 opacity-70">{c.contact.text}</p>
            <ul className="mt-8 space-y-2 text-sm">
              {p.email && (
                <li>
                  <a href={`mailto:${p.email}`} className="break-all underline-offset-4 hover:underline">
                    {p.email}
                  </a>
                </li>
              )}
              {socialLinks(p).map((l) => (
                <li key={l.name}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer me" className="underline-offset-4 hover:underline">
                    {l.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <ContactForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
