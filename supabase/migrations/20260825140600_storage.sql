-- Buckets Supabase Storage (section 31) + policies d'accès.

insert into storage.buckets (id, name, public)
values
  ('site-assets', 'site-assets', true),
  ('formation-assets', 'formation-assets', true),
  ('avatars', 'avatars', true),
  ('course-materials', 'course-materials', false),
  ('documents', 'documents', false)
on conflict (id) do nothing;

-- site-assets : lecture publique (logo, images institutionnelles), écriture SuperAdmin.
create policy "site_assets_public_read"
on storage.objects for select
using (bucket_id = 'site-assets');

create policy "site_assets_superadmin_insert"
on storage.objects for insert
with check (bucket_id = 'site-assets' and public.is_superadmin());

create policy "site_assets_superadmin_update"
on storage.objects for update
using (bucket_id = 'site-assets' and public.is_superadmin());

create policy "site_assets_superadmin_delete"
on storage.objects for delete
using (bucket_id = 'site-assets' and public.is_superadmin());

-- formation-assets : lecture publique (visuels de formation), écriture SuperAdmin.
create policy "formation_assets_public_read"
on storage.objects for select
using (bucket_id = 'formation-assets');

create policy "formation_assets_superadmin_insert"
on storage.objects for insert
with check (bucket_id = 'formation-assets' and public.is_superadmin());

create policy "formation_assets_superadmin_update"
on storage.objects for update
using (bucket_id = 'formation-assets' and public.is_superadmin());

create policy "formation_assets_superadmin_delete"
on storage.objects for delete
using (bucket_id = 'formation-assets' and public.is_superadmin());

-- avatars : lecture publique, écriture réservée au propriétaire (chemin avatars/{user_id}/...) + SuperAdmin.
create policy "avatars_public_read"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "avatars_owner_insert"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and (public.is_superadmin() or (storage.foldername(name))[1] = auth.uid()::text)
);

create policy "avatars_owner_update"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and (public.is_superadmin() or (storage.foldername(name))[1] = auth.uid()::text)
);

create policy "avatars_owner_delete"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and (public.is_superadmin() or (storage.foldername(name))[1] = auth.uid()::text)
);

-- course-materials : privé — lecture réservée aux inscrits approuvés (chemin
-- course-materials/{formation_id}/...) et au SuperAdmin ; écriture SuperAdmin uniquement.
create policy "course_materials_read"
on storage.objects for select
using (
  bucket_id = 'course-materials'
  and (
    public.is_superadmin()
    or public.is_enrolled(((storage.foldername(name))[1])::uuid)
  )
);

create policy "course_materials_superadmin_insert"
on storage.objects for insert
with check (bucket_id = 'course-materials' and public.is_superadmin());

create policy "course_materials_superadmin_update"
on storage.objects for update
using (bucket_id = 'course-materials' and public.is_superadmin());

create policy "course_materials_superadmin_delete"
on storage.objects for delete
using (bucket_id = 'course-materials' and public.is_superadmin());

-- documents : privé — pièces jointes du formulaire de demande de service.
-- L'upload est ouvert à tous (visiteur non connecté inclus, cf. section 12 :
-- "pièce jointe facultative" sur un formulaire public) ; à revoir en Phase 6
-- si l'upload est finalement fait via une Edge Function dédiée.
create policy "documents_insert_any"
on storage.objects for insert
with check (bucket_id = 'documents');

create policy "documents_read_owner_or_superadmin"
on storage.objects for select
using (
  bucket_id = 'documents'
  and (
    public.is_superadmin()
    or (auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text)
  )
);

create policy "documents_superadmin_update"
on storage.objects for update
using (bucket_id = 'documents' and public.is_superadmin());

create policy "documents_superadmin_delete"
on storage.objects for delete
using (bucket_id = 'documents' and public.is_superadmin());
