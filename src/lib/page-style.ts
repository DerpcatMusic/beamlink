import type { Platform } from "@lib/types";
import { platformBrandColors } from "@lib/platform-brand";
import type { TrackPaletteVars } from "@lib/palette";

export const PAGE_BACKGROUND_STYLES = ["blur", "ascii", "mesh", "aurora", "vinyl"] as const;
export type PageBackgroundStyle = (typeof PAGE_BACKGROUND_STYLES)[number];

export const BUTTON_STYLES = [
  "monochrome",
  "logo-color",
  "colored-border",
  "gradient-lr",
  "gradient-logo",
  "full-color"
] as const;
export type ButtonStyle = (typeof BUTTON_STYLES)[number];

export const DEFAULT_PAGE_BACKGROUND_STYLE: PageBackgroundStyle = "blur";
export const DEFAULT_BUTTON_STYLE: ButtonStyle = "monochrome";

export const pageBackgroundLabels: Record<PageBackgroundStyle, string> = {
  blur: "Blurred artwork",
  ascii: "ASCII mosaic",
  mesh: "Mesh gradient",
  aurora: "Aurora glow",
  vinyl: "Vinyl ripples"
};

export const pageBackgroundDescriptions: Record<PageBackgroundStyle, string> = {
  blur: "Soft cover art bloom — the current default.",
  ascii: "Blocky character grid tinted from the release palette.",
  mesh: "Layered radial gradients from artwork colors.",
  aurora: "Slow drifting color fields behind the release.",
  vinyl: "Concentric grooves echoing the album palette."
};

export const buttonStyleLabels: Record<ButtonStyle, string> = {
  monochrome: "Monochrome",
  "logo-color": "Logo color",
  "colored-border": "Colored border",
  "gradient-lr": "Gradient L→R",
  "gradient-logo": "Gradient + logo",
  "full-color": "Full color"
};

export const buttonStyleDescriptions: Record<ButtonStyle, string> = {
  monochrome: "Neutral glass buttons with white primary CTA.",
  "logo-color": "Platform brand tint on each icon.",
  "colored-border": "Subtle brand-colored outlines.",
  "gradient-lr": "Monochrome left edge fading into brand color.",
  "gradient-logo": "Gradient fill with tinted platform icons.",
  "full-color": "Solid platform-colored buttons."
};

export function normalizePageBackgroundStyle(value: string | null | undefined): PageBackgroundStyle {
  if (value && PAGE_BACKGROUND_STYLES.includes(value as PageBackgroundStyle)) {
    return value as PageBackgroundStyle;
  }
  return DEFAULT_PAGE_BACKGROUND_STYLE;
}

export function normalizeButtonStyle(value: string | null | undefined): ButtonStyle {
  if (value && BUTTON_STYLES.includes(value as ButtonStyle)) {
    return value as ButtonStyle;
  }
  return DEFAULT_BUTTON_STYLE;
}

export function platformIconTint(buttonStyle: ButtonStyle): boolean {
  return buttonStyle === "logo-color" || buttonStyle === "gradient-logo";
}

/** Full-color fills use ink on icons — brand tint on brand bg is invisible. */
export function platformIconInk(buttonStyle: ButtonStyle): boolean {
  return buttonStyle === "full-color";
}

export function platformBrandStyle(platform: Platform): string {
  const brand = platformBrandColors[platform];
  const ink = platformButtonInk(brand);
  return `--platform-brand: ${brand}; --platform-ink: ${ink}`;
}

export function platformButtonInk(brandHex: string): string {
  const rgb = parseHexColor(brandHex);
  if (!rgb) return "oklch(0.15 0.006 265)";
  const luminance = relativeLuminance(rgb);
  return luminance > 0.58 ? "oklch(0.15 0.006 265)" : "oklch(0.98 0.004 265)";
}

export function backgroundClasses(style: PageBackgroundStyle): string {
  return `smart-page--bg-${style}`;
}

export function buttonClasses(style: ButtonStyle): string {
  return `smart-page--btn-${style}`;
}

/** SVG tile for ASCII-style backgrounds — palette-driven, no image decode. */
export function asciiPatternDataUri(vars: TrackPaletteVars): string {
  const tint = vars["--page-tint"] ?? "oklch(0.2 0.04 280)";
  const accent = vars["--primary"] ?? "oklch(0.72 0.12 300)";
  const muted = vars["--muted"] ?? "oklch(0.55 0.03 280)";
  const chars = [".", ":", "-", "=", "+", "*", "#", "%", "@"];

  const rows: string[] = [];
  for (let y = 0; y < 12; y += 1) {
    for (let x = 0; x < 18; x += 1) {
      const index = (x * 7 + y * 11 + x * y) % chars.length;
      const color = index % 3 === 0 ? accent : index % 3 === 1 ? tint : muted;
      const char = chars[index] ?? ".";
      const px = 6 + x * 14;
      const py = 10 + y * 16;
      rows.push(
        `<text x="${px}" y="${py}" fill="${escapeXml(color)}" font-family="ui-monospace,monospace" font-size="11" opacity="0.55">${char}</text>`
      );
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="200" viewBox="0 0 260 200">${rows.join("")}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function parseHexColor(hex: string): { red: number; green: number; blue: number } | null {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return {
    red: Number.parseInt(normalized.slice(0, 2), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    blue: Number.parseInt(normalized.slice(4, 6), 16)
  };
}

function relativeLuminance(color: { red: number; green: number; blue: number }): number {
  const channels = [color.red, color.green, color.blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
