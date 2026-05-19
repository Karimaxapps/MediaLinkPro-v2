/**
 * Temporary debugging instrumentation: capture every server-side error
 * with full stack to `runtime-errors.log` in the project root.
 *
 * Hostinger's nginx rewrites Next.js 500 responses to a generic
 * "Internal Server Error" string before they reach the browser, which
 * strips the error digest. And the runtime log viewer only surfaces the
 * masked production error. This file bypasses both by writing the raw
 * error to disk where we can `cat` it via SSH.
 *
 * Remove this file once the prod 500s are debugged.
 */
export async function register() {
  // no-op; everything happens in onRequestError below
}

type ReqInfo = { path: string; method: string };
type CtxInfo = { routeType: string; routePath?: string };

export async function onRequestError(err: unknown, request: ReqInfo, context: CtxInfo) {
  try {
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
}
