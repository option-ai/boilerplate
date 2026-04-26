import { auth } from "@boilerplate/auth";
import { createRequestLogger } from "evlog";
import { maskEmail } from "evlog/better-auth";
import type { EvlogVariables } from "evlog/hono";
import { createMiddleware } from "hono/factory";

const SKIP_IDENTIFY_PREFIXES = ["/api/auth/", "/queue/"];

export const evlog = createMiddleware<EvlogVariables>(async (c, next) => {
  const log = createRequestLogger({
    method: c.req.method,
    path: c.req.path,
  });
  c.set("log", log);

  if (!SKIP_IDENTIFY_PREFIXES.some((p) => c.req.path.startsWith(p))) {
    try {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });
      const sessionUser = session?.user as
        | { id?: string; name?: string; email?: string }
        | undefined;
      if (sessionUser?.id) {
        const user: Record<string, string> = { id: sessionUser.id };
        if (sessionUser.name) user.name = sessionUser.name;
        if (sessionUser.email) user.email = maskEmail(sessionUser.email);
        log.set({ user });
      }
    } catch {
      // never let session resolution break the request
    }
  }

  try {
    await next();
    log.emit({ status: c.res.status });
  } catch (err) {
    log.error(err instanceof Error ? err : new Error(String(err)));
    log.emit({ status: 500 });
    throw err;
  }
});
