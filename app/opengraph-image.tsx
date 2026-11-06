import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/components/og-card";
import { getContent } from "@/lib/content";

// The picture shown when the website is shared on LinkedIn, Facebook, WhatsApp, etc.
export const alt = "Personal website and blog";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  const { profile } = await getContent();
  return new ImageResponse(
    (
      <OgCard
        kicker="Personal website & blog"
        title={profile.name}
        subtitle={[profile.role, profile.company].filter(Boolean).join(" · ")}
        initials={profile.initials}
        footer={profile.locations.join("  ·  ")}
      />
    ),
    size,
  );
}
