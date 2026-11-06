// The design used for share images (LinkedIn, Facebook, WhatsApp previews).
// Rendered by next/og, which supports a subset of CSS (flexbox, inline styles).

export const ogSize = { width: 1200, height: 630 };

export function OgCard({
  kicker,
  title,
  subtitle,
  initials,
  footer,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  initials: string;
  footer: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #0c1a2e 0%, #1d4e89 60%, #3b78c4 100%)",
        color: "white",
        fontFamily: "serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "white",
            color: "#1d4e89",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          {initials}
        </div>
        <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", opacity: 0.8 }}>{kicker}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: title.length > 60 ? 56 : 72, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 30, opacity: 0.8, lineHeight: 1.4 }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", fontSize: 24, opacity: 0.7 }}>{footer}</div>
    </div>
  );
}
