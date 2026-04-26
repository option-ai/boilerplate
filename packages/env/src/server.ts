import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const serverSchema = {
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  CORS_ORIGIN: z.url(),
  CORS_EXTRA_ORIGINS: z.string().optional(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().optional(),

  // # If using QStash
  // QSTASH_URL: z.string().min(1),
  // QSTASH_TOKEN: z.string().min(1),
  // QSTASH_CALLBACK_URL: z.url().optional(),
  // QSTASH_CURRENT_SIGNING_KEY: z.string().min(1),
  // QSTASH_NEXT_SIGNING_KEY: z.string().min(1),

  // # If using CRONs
  // CRON_SECRET: z.string().min(1),

  // # If using Gemini
  // GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
};

export const env = createEnv<undefined, typeof serverSchema>({
  server: serverSchema,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

function isLocalHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost")
  );
}

function addOriginWithVariants(origins: Set<string>, rawOrigin: string) {
  const originUrl = new URL(rawOrigin);
  const hostname = originUrl.hostname.toLowerCase();

  originUrl.hostname = hostname;
  origins.add(originUrl.origin);

  if (isLocalHostname(hostname)) {
    return;
  }

  if (hostname.startsWith("www.")) {
    const alternateUrl = new URL(originUrl.origin);
    alternateUrl.hostname = hostname.slice(4);
    origins.add(alternateUrl.origin);
  } else if (hostname.split(".").length === 2) {
    const alternateUrl = new URL(originUrl.origin);
    alternateUrl.hostname = `www.${hostname}`;
    origins.add(alternateUrl.origin);
  }
}

function parseAdditionalOrigins(rawOrigins?: string | null) {
  if (!rawOrigins) {
    return [];
  }

  return rawOrigins
    .split(/[\s,]+/)
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getTrustedAppOrigins(
  primaryOrigin: string,
  additionalOrigins?: string | null
) {
  const origins = new Set<string>();

  addOriginWithVariants(origins, primaryOrigin);

  for (const origin of parseAdditionalOrigins(additionalOrigins)) {
    addOriginWithVariants(origins, origin);
  }

  return Array.from(origins);
}
