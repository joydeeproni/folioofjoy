import { NextResponse } from 'next/server';

// Forwards "someone wants to get in touch" submissions to the site owner's
// inbox via Web3Forms. The access key is tied to the owner's email at
// web3forms.com and lives in WEB3FORMS_ACCESS_KEY (see .env.example).
export async function POST(req: Request) {
  const key = process.env.WEB3FORMS_ACCESS_KEY;
  if (!key || key === 'your-web3forms-access-key') {
    return NextResponse.json(
      { error: 'Email service is not configured.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email =
    typeof (body as { email?: unknown })?.email === 'string'
      ? (body as { email: string }).email.trim()
      : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  }

  let result: { success?: boolean } = {};
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: key,
        subject: 'Someone wants to get in touch — Folio of Joy',
        from_name: 'Folio of Joy',
        // Web3Forms uses this as the reply-to address.
        email,
        message: `${email} wants to get in touch with you via Folio of Joy.`,
      }),
    });
    result = await res.json().catch(() => ({}));
    if (!res.ok || !result.success) throw new Error('delivery failed');
  } catch {
    return NextResponse.json({ error: 'Could not send right now.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
