-- Create bucket safely
insert into storage.buckets (id, name, public) 
values ('uploads', 'uploads', true) 
on conflict do nothing;

-- Safely drop existing policies to avoid "already exists" errors
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Public Insert" on storage.objects;

-- Create policies
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'uploads' );

create policy "Public Insert" 
on storage.objects for insert 
with check ( bucket_id = 'uploads' );
