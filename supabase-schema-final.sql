-- 1. Crear la tabla de estado central si no existe
create table if not exists public.core_state (
  id text primary key,
  data jsonb not null
);

-- 2. Asegurarse de que exista la fila singleton
insert into public.core_state (id, data) values ('singleton', '{}'::jsonb) on conflict do nothing;

-- 3. Deshabilitar RLS en core_state para que todos los dispositivos puedan leer/escribir
alter table public.core_state disable row level security;

-- 4. Activar Realtime para la tabla core_state (importante para sincronización inmediata)
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.core_state;

-- 5. Crear el bucket de storage si no existe
insert into storage.buckets (id, name, public) 
values ('uploads', 'uploads', true) 
on conflict do nothing;

-- 6. Políticas del bucket (borramos y recreamos por seguridad)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Public Insert" on storage.objects;

create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'uploads' );

create policy "Public Insert" 
on storage.objects for insert 
with check ( bucket_id = 'uploads' );
