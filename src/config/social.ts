/**
 * Official MediaLinkPro social media accounts.
 * Single source of truth — used by the site footers and email templates.
 */

export type SocialPlatform = "linkedin" | "x" | "facebook";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/showcase/medialinkpro/" },
  { platform: "x", label: "X", href: "https://x.com/medialinkpro_" },
  { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/medialinkpro/" },
];
