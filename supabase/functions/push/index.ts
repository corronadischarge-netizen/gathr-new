// gathr: send one notification to the person's phones, through Firebase Cloud Messaging (step 6).
//
// The database calls this with just a notification id (see the notifications migration). Everything else is
// read here with the service key, so a forged call can't push a made-up message: it can only resend a real one
// that hasn't gone out yet.
//
// Secrets it needs (Supabase → Edge Functions → Secrets):
//   FCM_SERVICE_ACCOUNT  the Firebase service account key (JSON), from Firebase → Project settings → Service accounts
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.

type Env = { url: string; key: string; account: { project_id: string; client_email: string; private_key: string } | null };

function b64url(bytes: Uint8Array | string): string {
  const s = typeof bytes === 'string' ? bytes : String.fromCharCode(...bytes);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// a short-lived Google access token for FCM, from the service account (a signed JWT, RS256)
async function googleToken(account: NonNullable<Env['account']>, fetchFn: typeof fetch): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: account.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    })
  );
  const pem = account.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), (ch) => ch.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(head + '.' + claims)));
  const res = await fetchFn('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + head + '.' + claims + '.' + b64url(sig)
  });
  if (!res.ok) throw new Error('Google sign-in for FCM failed: ' + res.status + ' ' + (await res.text()));
  return (await res.json()).access_token;
}

export async function handle(req: Request, env: Env, fetchFn: typeof fetch = fetch): Promise<Response> {
  const reply = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  let id = '';
  try {
    id = String((await req.json()).id || '');
  } catch (_) {
    return reply(400, { error: 'Send { "id": "<notification id>" }' });
  }
  if (!/^[0-9a-f-]{36}$/.test(id)) return reply(400, { error: 'Not a notification id' });
  if (!env.account) return reply(500, { error: 'FCM_SERVICE_ACCOUNT secret is missing' });

  const db = (path: string, init: RequestInit = {}) =>
    fetchFn(env.url + '/rest/v1/' + path, {
      ...init,
      headers: { apikey: env.key, Authorization: 'Bearer ' + env.key, 'Content-Type': 'application/json', ...(init.headers || {}) }
    });

  const rows = await (await db('notifications?id=eq.' + id + '&select=*')).json();
  const n = rows && rows[0];
  if (!n) return reply(404, { error: 'No such notification' });
  if (n.pushed_at || !n.user_id) return reply(200, { sent: 0, skipped: n.pushed_at ? 'already sent' : 'not on gathr yet' });

  const tokens: { token: string }[] = await (await db('device_tokens?user_id=eq.' + n.user_id + '&select=token')).json();
  let sent = 0;
  if (tokens.length) {
    const access = await googleToken(env.account, fetchFn);
    // FCM data values must be strings
    const data: Record<string, string> = { notification_id: n.id, kind: n.kind };
    for (const [k, v] of Object.entries(n.data || {})) data[k] = String(v);
    for (const t of tokens) {
      const res = await fetchFn('https://fcm.googleapis.com/v1/projects/' + env.account.project_id + '/messages:send', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            token: t.token,
            notification: { title: n.title, body: n.body },
            data,
            android: { priority: 'high', notification: { color: '#531AFF' } }
          }
        })
      });
      if (res.ok) sent++;
      else if (res.status === 404 || /UNREGISTERED|INVALID_ARGUMENT/.test(await res.text())) {
        // the app was removed from that phone: forget it
        await db('device_tokens?token=eq.' + encodeURIComponent(t.token), { method: 'DELETE' });
      }
    }
  }
  await db('notifications?id=eq.' + id, { method: 'PATCH', body: JSON.stringify({ pushed_at: new Date().toISOString() }) });
  return reply(200, { sent });
}

// running on Supabase (Deno)
const deno = (globalThis as any).Deno;
if (deno) {
  const raw = deno.env.get('FCM_SERVICE_ACCOUNT');
  const env: Env = {
    url: deno.env.get('SUPABASE_URL') || '',
    key: deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    account: raw ? JSON.parse(raw) : null
  };
  deno.serve((req: Request) => handle(req, env));
}
