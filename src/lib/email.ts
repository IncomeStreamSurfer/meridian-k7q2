const RESEND_API = 'https://api.resend.com';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(opts: EmailOptions): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY not configured' };

  const body = {
    from: opts.from ?? 'Meridian <onboarding@resend.dev>',
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html: opts.html,
    reply_to: opts.replyTo,
  };

  try {
    const res = await fetch(`${RESEND_API}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.message ?? `Resend ${res.status}` };
    return { ok: true, id: data?.id };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? 'unknown email error' };
  }
}

export async function addToAudience(email: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const audienceId = import.meta.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) return { ok: false, error: 'audience not configured' };
  try {
    const res = await fetch(`${RESEND_API}/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.message ?? `Resend ${res.status}` };
    return { ok: true, id: data?.id };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? 'audience error' };
  }
}

export function welcomeEmailHtml(): string {
  return `
  <!doctype html>
  <html><body style="margin:0;padding:0;background:#f5ede1;font-family:Georgia,'Cormorant Garamond',serif;color:#0e0d0b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5ede1;padding:40px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#0e0d0b;color:#f5ede1;padding:48px;">
          <tr><td>
            <p style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:0.7;margin:0 0 24px;color:#c79a5a;">Meridian · Waitlist Confirmed</p>
            <h1 style="font-size:36px;line-height:1.1;margin:0 0 16px;font-family:Georgia,serif;">You're on the list.</h1>
            <p style="font-size:16px;line-height:1.6;opacity:0.85;margin:0 0 24px;font-family:Georgia,serif;">
              Thank you for joining the Meridian waitlist. The first hundred members get the inaugural lot — numbered, signed by the roaster, and shipped before public release.
            </p>
            <p style="font-size:16px;line-height:1.6;opacity:0.85;margin:0 0 32px;font-family:Georgia,serif;">
              We'll write once when the doors open. That's the deal.
            </p>
            <p style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;opacity:0.5;margin:0;">— The Meridian Team</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}
