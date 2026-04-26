import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@boilerplate/api/context";
import { appRouter } from "@boilerplate/api/routers/index";
import { auth } from "@boilerplate/auth";
import { env, getTrustedAppOrigins } from "@boilerplate/env/server";
import type { EvlogVariables } from "evlog/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { evlog } from "./evlog";

const app = new Hono<EvlogVariables>();
const trustedAppOrigins = getTrustedAppOrigins(
  env.CORS_ORIGIN,
  env.CORS_EXTRA_ORIGINS
);

app.use(evlog);
app.use(
  "/*",
  cors({
    origin: trustedAppOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  })
);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
