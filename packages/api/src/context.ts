import { auth } from "@boilerplate/auth";
import { db } from "@boilerplate/db";
import { createLogger, type RequestLogger } from "evlog";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  const log: RequestLogger =
    (context.get("log") as RequestLogger | undefined) ?? createLogger();
  return {
    db,
    session,
    log,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
