-- Storage policies for public uploads to bucket 'imagens' under folder 'logos/'
drop policy if exists "public_insert_imagens" on storage.objects;
drop policy if exists "public_update_imagens" on storage.objects;

create policy "public_insert_imagens"
on storage.objects
for insert
to public
with check (bucket_id = 'imagens' and name like 'logos/%');

create policy "public_update_imagens"
on storage.objects
for update
to public
using (bucket_id = 'imagens' and name like 'logos/%')
with check (bucket_id = 'imagens' and name like 'logos/%');
