-- Adds the missing "sender" column used by the restaurant -> admin support inbox.
-- Existing rows (sent by the admin to restaurants) get the default 'admin'.
alter table public.admin_messages
  add column if not exists sender text not null default 'admin';

alter table public.admin_messages
  drop constraint if exists admin_messages_sender_check;

alter table public.admin_messages
  add constraint admin_messages_sender_check check (sender in ('admin', 'restaurant'));

create index if not exists admin_messages_sender_created_idx
  on public.admin_messages (sender, created_at desc);

-- Make PostgREST pick up the new column immediately.
notify pgrst, 'reload schema';
