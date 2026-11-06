import Link from "next/link";
import type { SiteContent } from "@/lib/default-content";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-5xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

/** The social profiles that have been filled in (in /admin → Contact & links). */
export function socialLinks(p: SiteContent["profile"]) {
  return [
    { name: "LinkedIn", href: p.linkedin },
    { name: "Facebook", href: p.facebook },
    { name: "Instagram", href: p.instagram },
    { name: "YouTube", href: p.youtube },
  ].filter((l) => l.href);
}

export function SocialLinks({ c, className = "" }: { c: SiteContent; className?: string }) {
  return (
    <>
      {socialLinks(c.profile).map((l) => (
        <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer me" className={className}>
          {l.name} ↗
        </a>
      ))}
    </>
  );
}

const nav = [
  { href: "/blog", label: "Blog" },
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#skills", label: "Skills" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader({ c }: { c: SiteContent }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/75 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-linear-to-br from-accent to-accent/70 text-sm text-background shadow-md transition-transform group-hover:-rotate-6">
            {c.profile.initials}
          </span>
          <span className="hidden sm:inline">{c.profile.shortName}</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm text-muted">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="rounded-full px-3 py-1.5 transition-colors hover:bg-accent-soft hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/#contact"
            className="hidden rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:inline-block"
          >
            Get in touch
          </Link>
          {/* Mobile menu — no JavaScript needed */}
          <details className="relative md:hidden">
            <summary className="flex cursor-pointer list-none items-center rounded-md border border-border px-3 py-1.5 text-sm [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <ul className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-surface p-2 shadow-xl">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-md px-3 py-2 text-sm hover:bg-accent-soft">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </Container>
    </header>
  );
}

export function SiteFooter({ c }: { c: SiteContent }) {
  return (
    <footer className="border-t border-border py-10">
      <Container className="flex flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {c.profile.name}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <SocialLinks c={c} className="hover:text-foreground" />
          <span>{c.profile.locations.join(" · ")}</span>
        </div>
      </Container>
    </footer>
  );
}
