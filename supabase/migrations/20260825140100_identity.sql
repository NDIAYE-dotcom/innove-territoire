-- Rôles applicatifs + profils utilisateurs (liés à auth.users).

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  created_at timestamptz not null default now()
);

comment on table public.roles is
  'Rôles actifs : superadmin, client. admin/formateur/manager pourront être ajoutés ici plus tard sans changement de schéma (section 26/57 du prompt maître).';

insert into public.roles (key, label) values
  ('superadmin', 'Super administrateur'),
  ('client', 'Client');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  email text not null,
  first_name text,
  last_name text,
  phone text,
  organization text,
  function_title text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Profil applicatif de chaque utilisateur Supabase Auth (client ou superadmin).';

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- RLS n'agit qu'au niveau de la ligne : sans ce trigger, un client pourrait
-- modifier sa propre ligne (autorisé par profiles_update_own_or_superadmin)
-- en changeant role_id vers 'superadmin' ou en se réactivant lui-même.
-- Exception : les rôles qui contournent RLS (postgres du SQL Editor,
-- service_role des Edge Functions) restent autorisés — sinon la toute
-- première promotion SuperAdmin documentée dans SUPABASE.md serait bloquée.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
as $$
begin
  if not public.is_superadmin()
     and not exists (
       select 1 from pg_roles
       where rolname = current_user
         and (rolbypassrls or rolsuper)
     )
  then
    if new.role_id is distinct from old.role_id or new.is_active is distinct from old.is_active then
      raise exception 'Seul un SuperAdmin peut modifier le rôle ou le statut actif d''un profil.';
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_profiles_privileges
before update on public.profiles
for each row execute function public.protect_profile_privileges();

-- Crée automatiquement un profil "client" à chaque inscription Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  client_role_id uuid;
begin
  select id into client_role_id from public.roles where key = 'client';

  insert into public.profiles (id, role_id, email, first_name, last_name)
  values (
    new.id,
    client_role_id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- SECURITY DEFINER : évite la récursion RLS quand une policy sur `profiles`
-- a besoin de vérifier le rôle de l'utilisateur courant. Définie ici (et non
-- dans 20260825140000) car une fonction LANGUAGE SQL est analysée dès sa
-- création et exige donc que `profiles`/`roles` existent déjà.
create or replace function public.is_superadmin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = auth.uid()
      and r.key = 'superadmin'
  );
$$;

-- RLS

alter table public.roles enable row level security;

create policy "roles_select_all"
on public.roles for select
using (true);

create policy "roles_write_superadmin"
on public.roles for all
using (public.is_superadmin())
with check (public.is_superadmin());

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_superadmin"
on public.profiles for select
using (id = auth.uid() or public.is_superadmin());

create policy "profiles_update_own_or_superadmin"
on public.profiles for update
using (id = auth.uid() or public.is_superadmin());

create policy "profiles_insert_superadmin"
on public.profiles for insert
with check (public.is_superadmin());
