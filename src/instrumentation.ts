import * as Sentry from "@sentry/nextjs";

/**
 * Initializes Sentry for the active server runtime, and (still) writes raw
 * server-side errors to `runtime-errors.log` in the project root.
 *
 * The file-logging exists because Hostinger's nginx rewrites Next.js 500
 * responses to a generic "Internal Server Error" before they reach the
 * browser, stripping the error digest. We keep it as a local fallback that
 * can be read over SSH; Sentry is the primary, structured reporting channel.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = async (
  err: unknown,
  request: Parameters<typeof Sentry.captureRequestError>[1],
  context: Parameters<typeof Sentry.captureRequestError>[2]
) => {
  // 1) Local disk log (Hostinger SSH fallback). Node.js runtime only —
  //    node:fs/promises is unavailable in the Edge runtime (middleware).
  if (process.env.NEXT_RUNTIME === "nodejs") try {
    const { appendFile } = await import("node:fs/promises");
    const e = (err ?? {}) as {
      name?: string;
      message?: string;
      stack?: string;
      digest?: string;
      code?: string;
    };
    const line =
      [
        `\n=== ${new Date().toISOString()} ===`,
        `path: ${request?.path}`,
        `method: ${request?.method}`,
        `routeType: ${context?.routeType}`,
        `routePath: ${context?.routePath ?? "(unknown)"}`,
        `digest: ${e.digest ?? "(none)"}`,
        `code: ${e.code ?? "(none)"}`,
        `name: ${e.name ?? "(no name)"}`,
        `message: ${e.message ?? "(no message)"}`,
        `stack:\n${e.stack ?? "(no stack)"}`,
        "",
      ].join("\n") + "\n";
    await appendFile("runtime-errors.log", line);
  } catch {
    // swallow — never let logging break the request handler
  }

  // 2) Structured reporting to Sentry (no-ops if no DSN / not enabled).
  Sentry.captureRequestError(err, request, context);
};
