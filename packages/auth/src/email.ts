import { env } from "@boilerplate/env/server";
import { createLogger } from "evlog";
import { Resend } from "resend";

const DEFAULT_FROM = "Option <onboarding@tryoption.ai>";

const log = createLogger();

export async function sendMagicLinkEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL ?? DEFAULT_FROM;

  if (!apiKey) {
    log.info("auth.magic_link.skipped_no_api_key", { to, url });
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: "Seu link de acesso ao BOILERPLATE!",
    html: renderHtml(url),
    text: renderText(url),
  });

  if (error) {
    throw new Error(`Resend request failed: ${error.name} — ${error.message}`);
  }
}

function renderHtml(url: string) {
  return `<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #111;">
    <h1 style="font-size: 18px; margin-bottom: 16px;">Entrar no BOILERPLATE</h1>
    <p style="font-size: 14px; line-height: 1.5;">
      Clique no botão abaixo para acessar sua conta. Este link expira em 15 minutos.
    </p>
    <p style="margin: 24px 0;">
      <a href="${url}" style="background: #111; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 14px;">
        Entrar
      </a>
    </p>
    <p style="font-size: 12px; color: #666;">
      Se você não solicitou este e-mail, pode ignorá-lo.
    </p>
  </body>
</html>`;
}

function renderText(url: string) {
  return `Entrar no BOILERPLATE

Clique no link abaixo para acessar sua conta. Este link expira em 15 minutos.

${url}

Se você não solicitou este e-mail, pode ignorá-lo.`;
}
