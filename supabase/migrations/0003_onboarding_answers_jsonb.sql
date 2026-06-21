-- Pharos — onboarding_answers.answers: TEXT → JSONB.
--
-- The column held a JSON STRING (the app called JSON.stringify on write and
-- JSON.parse on read). Storing it as JSONB gives DB-level validation, lets us
-- query/index fields, and lets the client send the object directly. Existing
-- rows contain a valid JSON object string, so `answers::jsonb` parses cleanly.
--
-- SupabaseRepo.saveOnboarding now sends the object (no JSON.stringify); the read
-- path still tolerates the legacy string form for safety.

alter table public.onboarding_answers
  alter column answers type jsonb using answers::jsonb;
