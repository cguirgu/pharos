// delete-account — permanently deletes the calling user's auth account.
//
// The app invokes this (supabase.functions.invoke('delete-account')) with the
// user's session JWT attached. We resolve the caller from that JWT, then use the
// service-role key to delete the auth user. Every per-account table references
// auth.users(id) ON DELETE CASCADE, so all synced rows go with it.
//
// Deploy: `supabase functions deploy delete-account`
// (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are provided to
// Edge Functions automatically — no extra secret to set.)
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401);

    const url = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Resolve the caller from their JWT (anon client scoped to the request).
    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userErr } = await caller.auth.getUser();
    if (userErr || !user) return json({ error: 'Not authenticated' }, 401);

    // Delete the auth user with the service role → cascades all owned rows.
    const admin = createClient(url, serviceKey);
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) return json({ error: delErr.message }, 500);

    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
