import { createDb } from "@boilerplate/db";
import * as schema from "@boilerplate/db/schema/auth";
import { env, getTrustedAppOrigins } from "@boilerplate/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { sendMagicLinkEmail } from "./email";

function getSharedCookieDomain(appUrl: string) {
  const hostname = new URL(appUrl).hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost")
  ) {
    return null;
  }

  return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
}

export function createAuth() {
  const db = createDb();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
    }),
    trustedOrigins: getTrustedAppOrigins(
      env.CORS_ORIGIN,
      env.CORS_EXTRA_ORIGINS
    ),
    emailAndPassword: {
      enabled: false,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      crossSubDomainCookies: (() => {
        const domain = getSharedCookieDomain(env.CORS_ORIGIN);

        return domain
          ? {
              enabled: true,
              domain,
            }
          : undefined;
      })(),
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    plugins: [
      magicLink({
        expiresIn: 60 * 15,
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLinkEmail({ to: email, url });
        },
      }),
    ],
  });
}

export const auth = createAuth();
