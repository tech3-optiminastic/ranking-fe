import { ImageResponse } from "next/og";
import { SITE_BRAND, SITE_TAGLINE } from "@/lib/seo";

export const runtime = "edge";
export const alt = `${SITE_BRAND} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 45%, #2a0c08 75%, #3a0e08 100%)",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ff6b3d 0%, #e04a3d 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            fontWeight: 800,
          }}
        >
          S
        </div>
        <div style={{ fontSize: "30px", fontWeight: 700, letterSpacing: "-0.02em" }}>
          {SITE_BRAND}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "920px" }}>
        <div
          style={{
            fontSize: "13px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#ff9a7a",
            fontWeight: 600,
          }}
        >
          GEO · AEO · AI search visibility
        </div>
        <div
          style={{
            fontSize: "68px",
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-0.025em",
          }}
        >
          Score, monitor, and improve how AI engines cite your brand.
        </div>
        <div
          style={{
            fontSize: "26px",
            lineHeight: 1.35,
            color: "#d4cfca",
            fontWeight: 400,
            maxWidth: "880px",
          }}
        >
          ChatGPT · Claude · Gemini · Perplexity · Google AI
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "18px",
          color: "#a39d96",
        }}
      >
        <div>signalor.ai</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }}
          />
          <span>Free GEO + AEO audit</span>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
