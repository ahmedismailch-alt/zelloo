-- Zelloo: free trial (15 days, no credit card). Run once in the Supabase SQL Editor.
-- Existing restaurants get a fresh 15 days starting from the moment this is run.
alter table restaurants
  add column if not exists trial_ends_at timestamptz default (now() + interval '15 days');

update restaurants
set trial_ends_at = now() + interval '15 days'
where trial_ends_at is null;
