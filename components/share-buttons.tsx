"use client";

import { useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getUrl = () => window.location.href.split("#")[0];
const canNativeShare = () => typeof navigator.share === "function";

/** Share a blog post on social networks, copy its link, or use the phone's share menu. */
export function ShareButtons({ title, compact = false }: { title: string; compact?: boolean }) {
  // Read the page URL only in the browser (it's empty during server rendering).
  const url = useSyncExternalStore(subscribe, getUrl, () => "");
  const native = useSyncExternalStore(subscribe, canNativeShare, () => false);
  const [copied, setCopied] = useState(false);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: "in" },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: "f" },
    { name: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, icon: "wa" },
    { name: "X", href: `https://x.com/intent/post?text=${t}&url=${u}`, icon: "𝕏" },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  const btn =
    "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-md";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!compact && <span className="mr-1 text-xs font-medium uppercase tracking-[0.15em] text-muted">Share</span>}
      {native && (
        <button type="button" className={`${btn} bg-accent text-background hover:text-background`} onClick={() => navigator.share({ title, url }).catch(() => {})}>
          Share…
        </button>
      )}
      {links.map((l) => (
        <a
          key={l.name}
          href={url ? l.href : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
          aria-label={`Share on ${l.name}`}
        >
          <span aria-hidden className="grid size-4 place-items-center rounded-sm bg-accent-soft text-[9px] font-bold text-accent">
            {l.icon}
          </span>
          {l.name}
        </a>
      ))}
      <button type="button" onClick={copy} className={btn}>
        {copied ? "✓ Link copied" : "Copy link"}
      </button>
    </div>
  );
}
