/**
 * Renders a JSON-LD structured-data script tag for search engines and AI crawlers.
 * Pass a schema.org object (or array of objects) as `data`.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
