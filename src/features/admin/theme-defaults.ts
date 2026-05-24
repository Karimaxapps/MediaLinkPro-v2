export type ThemeSettings = {
  brand: string;
  brand_secondary: string;
  brand_success: string;
  brand_warning: string;
  brand_destructive: string;
  updated_at?: string;
};

export const DEFAULT_THEME: ThemeSettings = {
  brand: "#C6A85E",
  brand_secondary: "#135BEC",
  brand_success: "#16A34A",
  brand_warning: "#F59E0B",
  brand_destructive: "#EF4444",
};

export const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function sanitizeHex(value: string | null | undefined, fallback: string): string {
  if (typeof value === "string" && HEX_RE.test(value.trim())) return value.trim();
  return fallback;
}
