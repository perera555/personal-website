import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { getContent } from "@/lib/content";
import { getSiteUrl, nameVariants } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();
  const names = nameVariants(profile.name, profile.shortName);
  const title = `${profile.name}${profile.role ? ` — ${profile.role}` : ""} | Personal Website & Blog`;
  const description = `${profile.name} (${names.slice(1).join(", ")}): ${profile.tagline}`;
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: title, template: `%s — ${profile.shortName || profile.name}` },
    description,
    applicationName: profile.name,
    authors: [{ name: profile.name, url: getSiteUrl() }],
    creator: profile.name,
    keywords: [...names, profile.role, profile.company, "personal website", "blog", ...profile.locations].filter(Boolean),
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description: profile.tagline,
      type: "profile",
      siteName: profile.name,
      locale: "en_AU",
    },
    twitter: { card: "summary_large_image", title, description: profile.tagline },
    // Google Search Console: paste the verification code into GOOGLE_SITE_VERIFICATION
    verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
