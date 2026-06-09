/**
 * Plain HTML email templates — minimal, dark-themed, dependency-free.
 */

import { SOCIAL_LINKS } from "@/config/social";

// Canonical public base URL for everything linked from an email. Emails are
// always opened on real devices, so a localhost value (used in dev) must never
// leak into links or image sources — fall back to the production domain.
// Set NEXT_PUBLIC_SITE_URL (or NEXT_PUBLIC_APP_URL) to the real domain in prod.
const PRODUCTION_URL = "https://medialinkpro.net";
const CONFIGURED_URL = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
const APP_URL =
  CONFIGURED_URL && !CONFIGURED_URL.includes("localhost") && !CONFIGURED_URL.includes("127.0.0.1")
    ? CONFIGURED_URL.replace(/\/$/, "")
    : PRODUCTION_URL;

// Public asset + brand links used in emails. Image URLs must be absolute and
// publicly reachable (email clients can't load relative paths).
const LOGO_URL = `${APP_URL}/logo.png`;
const COMPANY_ADDRESS = "MediaLinkPro — The Media Network for broadcast &amp; production professionals.";

// Real social platform icons (white-circle brand chips generated into
// public/brand/social/). Inline SVG/icon-fonts don't survive email clients, so
// these are hosted PNGs referenced by absolute URL.
const SOCIAL_ICONS_ROW = SOCIAL_LINKS.map(
  (s) =>
    `<a href="${s.href}" style="text-decoration:none;display:inline-block;margin-right:8px;"><img src="${APP_URL}/brand/social/${s.platform}.png" width="28" height="28" alt="${s.label}" style="display:inline-block;border:0;border-radius:50%;"></a>`
).join("");

type WrapOptions = { hero?: boolean };

const wrap = (
  title: string,
  body: string,
  cta?: { url: string; label: string },
  footer?: string,
  opts: WrapOptions = {}
) =>
  `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0B0F14;color:#e5e7eb;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F14;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;max-width:560px;">
        <!-- Header -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid rgba(198,168,94,0.25);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td style="padding-right:10px;"><img src="${LOGO_URL}" width="30" height="30" alt="MediaLinkPro" style="display:block;border:0;border-radius:7px;"></td>
                  <td style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.02em;">MediaLink<span style="color:#C6A85E;">Pro</span></td>
                </tr></table>
              </td>
              <td align="right" style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">The Media Network</td>
            </tr>
          </table>
        </td></tr>
        ${opts.hero ? `<!-- Hero -->
        <tr><td bgcolor="#C6A85E" style="background:#C6A85E;background:linear-gradient(135deg,#D9BE76 0%,#C6A85E 55%,#9C7E3A 100%);padding:36px 32px;">
          <h1 style="margin:0;color:#1a1308;font-size:26px;font-weight:800;line-height:1.25;letter-spacing:-0.01em;">${title}</h1>
        </td></tr>` : ""}
        <!-- Body -->
        <tr><td style="padding:32px;">
          ${opts.hero ? "" : `<h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 16px;line-height:1.3;">${title}</h1>`}
          <div style="color:#d1d5db;font-size:15px;line-height:1.7;">${body}</div>
          ${cta ? `<div style="margin-top:28px;"><a href="${cta.url}" style="display:inline-block;background:#C6A85E;color:#000000;padding:13px 28px;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">${cta.label}</a></div>` : ""}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.08);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding-bottom:14px;">
              <span style="color:#9ca3af;font-size:13px;font-weight:600;vertical-align:middle;margin-right:10px;">Follow us</span>
              ${SOCIAL_ICONS_ROW}
            </td></tr>
            <tr><td style="color:#6b7280;font-size:12px;line-height:1.6;">
              ${footer ?? `You received this email because of your account on <a href="${APP_URL}" style="color:#C6A85E;text-decoration:none;">MediaLinkPro</a>.`}
            </td></tr>
            <tr><td style="padding-top:10px;color:#4b5563;font-size:11px;line-height:1.6;">
              ${COMPANY_ADDRESS}<br/>
              <a href="${APP_URL}/settings/notifications" style="color:#6b7280;text-decoration:underline;">Manage preferences</a>
              &nbsp;·&nbsp;<a href="${APP_URL}/settings/notifications" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

export const emailTemplates = {
  welcome: (firstName: string) => ({
    subject: "Welcome to MediaLinkPro — you're in!",
    html: wrap(
      `Welcome, ${firstName}!`,
      `Your profile is live and you're officially part of the MediaLinkPro network — the go-to place for media professionals, products, and organisations.<br/><br/>
Here's what you can do right now:<br/>
<ul style="margin:12px 0;padding-left:20px;color:#d1d5db;">
  <li style="margin-bottom:8px;">Explore products and bookmark ones you love</li>
  <li style="margin-bottom:8px;">Connect with media professionals in your field</li>
  <li style="margin-bottom:8px;">Add or claim your company page</li>
  <li style="margin-bottom:8px;">Request demos from vendors</li>
</ul>
Your journey starts on the dashboard.`,
      { url: `${APP_URL}/dashboard`, label: "Go to my dashboard" },
      `You're receiving this because you just joined <a href="${APP_URL}" style="color:#C6A85E;text-decoration:none;">MediaLinkPro</a>. Welcome aboard!`,
      { hero: true }
    ),
  }),

  connectionRequest: (actorName: string, profileUrl: string) => ({
    subject: `${actorName} wants to connect`,
    html: wrap(
      "New connection request",
      `<strong>${actorName}</strong> has sent you a connection request on MediaLinkPro.`,
      { url: profileUrl, label: "View request" }
    ),
  }),
  demoRequest: (actorName: string, productName: string, requestUrl: string) => ({
    subject: `New demo request for ${productName}`,
    html: wrap(
      "New demo request",
      `<strong>${actorName}</strong> requested a demo of <strong>${productName}</strong>.`,
      { url: requestUrl, label: "Review request" }
    ),
  }),
  eventInvite: (eventTitle: string, eventUrl: string) => ({
    subject: `You're invited: ${eventTitle}`,
    html: wrap("Event invitation", `You've been invited to <strong>${eventTitle}</strong>.`, {
      url: eventUrl,
      label: "View event",
    }),
  }),
  newMessage: (senderName: string, messageUrl: string) => ({
    subject: `New message from ${senderName}`,
    html: wrap("New direct message", `<strong>${senderName}</strong> sent you a message.`, {
      url: messageUrl,
      label: "Open conversation",
    }),
  }),
  jobApplication: (applicantName: string, jobTitle: string, reviewUrl: string) => ({
    subject: `New application: ${jobTitle}`,
    html: wrap(
      "New job application",
      `<strong>${applicantName}</strong> just applied to <strong>${jobTitle}</strong>.`,
      { url: reviewUrl, label: "Review application" }
    ),
  }),
  jobReply: (
    companyName: string,
    jobTitle: string,
    statusLabel: string,
    body: string,
    jobUrl: string
  ) => ({
    subject: `${companyName} responded to your application`,
    html: wrap(
      `Update on ${jobTitle}`,
      `<strong>${companyName}</strong> marked your application as <strong>${statusLabel}</strong>.<br/><br/>${body ? body.replace(/\n/g, "<br/>") : "Open MediaLinkPro for the full message."}`,
      { url: jobUrl, label: "Open application" }
    ),
  }),
  claimDecision: (
    companyName: string,
    approved: boolean,
    note: string,
    companyUrl: string
  ) => ({
    subject: approved
      ? `Your claim for ${companyName} was approved`
      : `Update on your claim for ${companyName}`,
    html: wrap(
      approved ? "Claim approved" : "Claim not approved",
      approved
        ? `Good news — your request to claim <strong>${companyName}</strong> has been approved. You can now manage the company page, add products, and connect with media pros.${
            note ? `<br/><br/><strong>Note from our team:</strong><br/>${note.replace(/\n/g, "<br/>")}` : ""
          }`
        : `Your request to claim <strong>${companyName}</strong> was not approved.${
            note ? `<br/><br/><strong>Reason:</strong><br/>${note.replace(/\n/g, "<br/>")}` : ""
          }`,
      { url: companyUrl, label: approved ? "Manage your company" : "View company" }
    ),
  }),
  interviewScheduled: (
    companyName: string,
    jobTitle: string,
    when: string,
    where: string,
    jobUrl: string
  ) => ({
    subject: `Interview scheduled: ${jobTitle}`,
    html: wrap(
      "Interview scheduled",
      `<strong>${companyName}</strong> has scheduled an interview for <strong>${jobTitle}</strong>.<br/><br/><strong>When:</strong> ${when}<br/><strong>Where:</strong> ${where || "See application"}`,
      { url: jobUrl, label: "Open application" }
    ),
  }),
};
