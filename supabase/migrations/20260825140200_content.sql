-- Contenu institutionnel administrable : domaines d'intervention et prestations.
-- Reflète src/data/institutionalContent.js (Phase 2). Le front-end reste sur les
-- données statiques jusqu'au branchement CMS (Phase 10) ; ces tables sont
-- préparées et seedées dès maintenant pour que ce branchement soit direct.

create table public.domains (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  icon text,
  image_url text,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.domains is 'Domaines d''intervention du cabinet (page /domaines, cards Accueil).';

create trigger set_domains_updated_at
before update on public.domains
for each row execute function public.set_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  domain_id uuid references public.domains(id) on delete set null,
  icon text,
  image_url text,
  advantages jsonb not null default '[]'::jsonb,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.services is 'Prestations du cabinet (page /prestations, cards Accueil, "Demander ce service").';

create trigger set_services_updated_at
before update on public.services
for each row execute function public.set_updated_at();

-- RLS : lecture publique des éléments actifs, écriture réservée au SuperAdmin.

alter table public.domains enable row level security;

create policy "domains_select_active_or_superadmin"
on public.domains for select
using (is_active = true or public.is_superadmin());

create policy "domains_insert_superadmin"
on public.domains for insert
with check (public.is_superadmin());

create policy "domains_update_superadmin"
on public.domains for update
using (public.is_superadmin());

create policy "domains_delete_superadmin"
on public.domains for delete
using (public.is_superadmin());

alter table public.services enable row level security;

create policy "services_select_active_or_superadmin"
on public.services for select
using (is_active = true or public.is_superadmin());

create policy "services_insert_superadmin"
on public.services for insert
with check (public.is_superadmin());

create policy "services_update_superadmin"
on public.services for update
using (public.is_superadmin());

create policy "services_delete_superadmin"
on public.services for delete
using (public.is_superadmin());
