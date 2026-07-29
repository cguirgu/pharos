// submit-feedback — turns an in-app feedback submission into a Linear issue.
//
// The app calls this via supabase.functions.invoke('submit-feedback', { body }).
// `invoke` attaches the anon apikey automatically, and the signed-in user's JWT
// when there is one — so guests submit anonymously. We derive the (optional) user
// identity from that JWT server-side (never trust a client-sent identity), then
// create a Linear issue using the LINEAR_API_KEY secret.
//
// Deploy:  supabase functions deploy submit-feedback
// Secrets: supabase secrets set LINEAR_API_KEY=lin_api_xxx LINEAR_TEAM_ID=<team-uuid>
// (SUPABASE_URL / SUPABASE_ANON_KEY are injected automatically.)
import { createClient } from 'jsr:@supabase/supabase-js@2';

const LINEAR_GRAPHQL = 'https://api.linear.app/graphql';

// Mirrors src/domain/feedback.ts (that module can't be imported into Deno). Keep
// the two in sync.
const TYPE_LABEL: Record<string, string | null> = {
  bug: 'Bug',
  content: 'Enhancement',
  idea: 'Feature',
  other: null,
};
const TYPE_TITLE: Record<string, string> = { bug: 'Bug', content: 'Content', idea: 'Idea', other: 'Other' };
const PRIORITY_INT: Record<string, number> = { urgent: 1, high: 2, normal: 3 };
const COMMUNITY_FEEDBACK_LABEL = 'Community feedback';
const MAX_MESSAGE = 2000;

const isType = (v: unknown): v is keyof typeof TYPE_LABEL =>
  typeof v === 'string' && v in TYPE_LABEL;
const isPriority = (v: unknown): v is keyof typeof PRIORITY_INT =>
  typeof v === 'string' && v in PRIORITY_INT;

async function linear(apiKey: string, query: string, variables: Record<string, unknown>) {
  const res = await fetch(LINEAR_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: apiKey },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(`Linear API error: ${JSON.stringify(json.errors ?? json)}`);
  }
  return json.data;
}

Deno.serve(async (req) => {
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  try {
    const apiKey = Deno.env.get('LINEAR_API_KEY');
    const teamId = Deno.env.get('LINEAR_TEAM_ID');
    if (!apiKey || !teamId) return json({ error: 'Feedback is not configured on the server.' }, 500);

    const payload = await req.json().catch(() => null);
    if (!payload) return json({ error: 'Invalid body' }, 400);

    const { type, priority, screen, message, appVersion, platform } = payload as Record<string, unknown>;
    if (!isType(type) || !isPriority(priority)) return json({ error: 'Invalid type or priority' }, 400);
    const text = typeof message === 'string' ? message.trim().slice(0, MAX_MESSAGE) : '';
    if (!text) return json({ error: 'Message is required' }, 400);

    // Best-effort identity: resolve a real user from their JWT, else "Anonymous".
    let who = 'Anonymous';
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const url = Deno.env.get('SUPABASE_URL')!;
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
        const { data: { user } } = await caller.auth.getUser();
        if (user) who = user.email ?? user.id;
      } catch {
        // fall through as anonymous
      }
    }

    // Resolve label ids by name against the target team (case-insensitive).
    const wanted = [COMMUNITY_FEEDBACK_LABEL, TYPE_LABEL[type]].filter(Boolean) as string[];
    const data = await linear(apiKey, `query($teamId: String!) {
      team(id: $teamId) { labels(first: 250) { nodes { id name } } }
    }`, { teamId });
    const nodes: { id: string; name: string }[] = data?.team?.labels?.nodes ?? [];
    const byName = new Map(nodes.map((n) => [n.name.toLowerCase(), n.id]));
    const labelIds = wanted
      .map((name) => byName.get(name.toLowerCase()))
      .filter((id): id is string => Boolean(id));

    const firstLine = text.split('\n')[0]!.trim();
    const snippet = firstLine.length > 80 ? `${firstLine.slice(0, 79)}…` : firstLine;
    const title = `[Feedback] ${TYPE_TITLE[type]} — ${snippet}`;

    const description = [
      text,
      '',
      '---',
      `- **From:** ${who}`,
      `- **Type:** ${TYPE_TITLE[type]}`,
      `- **Priority:** ${String(priority)}`,
      `- **Screen:** ${typeof screen === 'string' && screen ? screen : '—'}`,
      `- **App version:** ${typeof appVersion === 'string' ? appVersion : '—'}`,
      `- **Platform:** ${typeof platform === 'string' ? platform : '—'}`,
      '',
      '_Submitted from in-app feedback._',
    ].join('\n');

    const created = await linear(apiKey, `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) { success issue { identifier url } }
    }`, {
      input: { teamId, title, description, priority: PRIORITY_INT[priority], labelIds },
    });

    if (!created?.issueCreate?.success) return json({ error: 'Linear rejected the issue' }, 502);
    return json({ ok: true, url: created.issueCreate.issue?.url ?? null }, 200);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
