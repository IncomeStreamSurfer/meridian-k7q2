import type { APIRoute } from 'astro';
import { adminSupabase, isSupabaseConfigured } from '../../lib/supabase';
import { addToAudience, sendEmail, welcomeEmailHtml } from '../../lib/email';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  let email = '';
  let company = '';
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await request.json();
      email = String(body?.email ?? '').trim().toLowerCase();
      company = String(body?.company ?? '').trim();
    } else {
      const form = await request.formData();
      email = String(form.get('email') ?? '').trim().toLowerCase();
      company = String(form.get('company') ?? '').trim();
    }
  } catch {
    return json({ error: 'Could not parse body' }, 400);
  }

  if (company) return json({ ok: true }, 200); // honeypot
  if (!email || !EMAIL_RE.test(email)) {
    return json({ error: 'Please enter a valid email address' }, 400);
  }

  const errors: string[] = [];
  let stored = false;

  // Try Supabase first when configured
  if (isSupabaseConfigured) {
    const sb = adminSupabase();
    if (sb) {
      const { error } = await sb
        .from('waitlist_signups')
        .insert({ email, source: 'landing-hero' });
      if (error && !/duplicate|unique/i.test(error.message)) {
        errors.push(`supabase: ${error.message}`);
      } else {
        stored = true;
      }
    }
  }

  // Always sync to Resend audience (primary path while Supabase is being settled)
  const aud = await addToAudience(email);
  if (aud.ok) stored = true;
  else if (!/already exists|conflict/i.test(aud.error || '')) {
    errors.push(`audience: ${aud.error}`);
  } else {
    stored = true;
  }

  // Fire welcome email (best-effort, non-blocking for the signup outcome)
  await sendEmail({
    to: email,
    subject: 'You\u2019re on the Meridian waitlist',
    html: welcomeEmailHtml(),
  }).catch(() => undefined);

  if (!stored && errors.length) {
    console.error('subscribe failed', errors);
    return json({ error: 'Could not save your email. Try again in a moment.' }, 500);
  }

  return json({ ok: true }, 200);
};

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
