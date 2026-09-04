-- Pharos — constrain what can be written to push_tokens.
--
-- 0004 allowed anonymous inserts with `with check (true)`, which is required:
-- the app is usable as a guest, and a guest who opts in to release
-- announcements has no auth.uid() to key a policy on. But an unconstrained
-- insert lets anyone holding the (shipped, therefore public) anon key stuff the
-- table with arbitrary rows, which would bloat the table and lengthen every
-- announcement run.
--
-- These constraints raise the bar cheaply, without moving guest registration
-- behind a backend endpoint:
--
--   * `token` must look like an Expo push token. Expo mints
--     `ExponentPushToken[...]` (and the newer `ExpoPushToken[...]`), so free-text
--     junk is rejected at the database rather than discovered by the send script.
--   * `platform` is limited to the two the app actually builds for.
--   * `app_version` is length-capped, so it cannot be used as free storage.
--
-- ⚠️ RESIDUAL RISK, stated plainly: a determined attacker with the anon key can
-- still insert well-formed but fake tokens. This constrains the shape, not the
-- rate. The full fix is to move registration behind a rate-limited edge
-- function with device attestation; that is an architectural decision, and
-- until it is taken, the send script's dead-token pruning is the backstop —
-- Expo reports fabricated tokens as DeviceNotRegistered and they are deleted.

alter table public.push_tokens
  drop constraint if exists push_tokens_token_format;
alter table public.push_tokens
  add constraint push_tokens_token_format
  check (token ~ '^Expo(nent)?PushToken\[[A-Za-z0-9_-]{1,128}\]$');

alter table public.push_tokens
  drop constraint if exists push_tokens_platform_valid;
alter table public.push_tokens
  add constraint push_tokens_platform_valid
  check (platform in ('ios', 'android'));

alter table public.push_tokens
  drop constraint if exists push_tokens_app_version_len;
alter table public.push_tokens
  add constraint push_tokens_app_version_len
  check (app_version is null or length(app_version) <= 32);
