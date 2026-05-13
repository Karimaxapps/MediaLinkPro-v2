import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
        FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "javascript"],
    });
}
