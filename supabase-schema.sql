-- Execute this SQL in your Supabase SQL Editor:
create table if not exists public.core_state (
  id text primary key,
  data jsonb not null
);

insert into public.core_state (id, data) 
values ('singleton', '{}'::jsonb) 
on conflict do nothing;
