import { ImageResponse } from "next/og";
import {
  getBranding,
  getRestaurant,
  isValidRestaurantId,
} from "../../../lib/supabase-server";

export const alt = "Menü ansehen und direkt bestellen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FALLBACK_COLOR = "#ff6b00";

function readableTextColor(hex: string): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return "#ffffff";
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#ffffff";
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let name = "Zelloo";
  let logoUrl: string | null = null;
  let color = FALLBACK_COLOR;

  if (isValidRestaurantId(id)) {
    const [restaurant, branding] = await Promise.all([
      getRestaurant(id).catch(() => null),
      getBranding(id).catch(() => null),
    ]);
    if (restaurant?.name) name = restaurant.name;
    if (branding?.logoUrl) logoUrl = branding.logoUrl;
    if (branding?.brandColor) color = branding.brandColor;
  }

  const textColor = readableTextColor(color);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: color,
          color: textColor,
          padding: 64,
          textAlign: "center",
        }}
      >
        {logoUrl ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 200,
              height: 200,
              borderRadius: 40,
              background: "#ffffff",
              marginBottom: 40,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt=""
              width={160}
              height={160}
              style={{ objectFit: "contain" }}
            />
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            fontSize: name.length > 24 ? 72 : 96,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 1050,
            justifyContent: "center",
          }}
        >
          {name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 48,
            fontWeight: 600,
            opacity: 0.92,
          }}
        >
          Menü ansehen und direkt bestellen
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            padding: "14px 36px",
            borderRadius: 999,
            background: textColor,
            color: color,
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          Jetzt bestellen
        </div>
      </div>
    ),
    { ...size }
  );
}
