/**
 * The public address of the website, used for Google (sitemap, canonical links)
 * and for share previews. Set SITE_URL once you have your own domain.
 * On Vercel, it falls back to the project's production address automatically.
 */
export function getSiteUrl() {
  const fromEnv =
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
  return (fromEnv ?? "http://localhost:3000").replace(/\/+$/, "");
}

/** Every way people might search for the name, e.g. "Dhanushka Perera", "Thamara Perera". */
export function nameVariants(full: string, short: string) {
  const parts = full.split(/\s+/).filter(Boolean);
  const firstLast = parts.length > 2 ? `${parts[0]} ${parts[parts.length - 1]}` : "";
  return [...new Set([full, short, firstLast].filter(Boolean))];
}

/** Safely embed structured data (JSON-LD) in a <script> tag. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
