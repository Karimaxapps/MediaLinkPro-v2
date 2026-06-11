import DOMPurify from "isomorphic-dompurify";

// Strict allowlist for user-authored rich text (TipTap output: blog posts, job
// and event descriptions, support articles). Anything not listed here is
// stripped — far safer than a forbid-list, which fails open on any tag/attr we
// didn't think to block.
const ALLOWED_TAGS = [
  "p", "br", "hr", "span", "div",
  "strong", "b", "em", "i", "u", "s", "del", "mark", "sub", "sup", "small",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
];

const ALLOWED_ATTR = [
  "href", "target", "rel", "title",
  "src", "alt", "width", "height",
  "class", "colspan", "rowspan",
];

// Prevent reverse-tabnabbing on links that open a new tab.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // DOMPurify still blocks dangerous URI schemes (javascript:, etc.) on
    // href/src by default.
  });
}
