-- Demandes de service (section 12) + messagerie associée (section 23).

create sequence public.service_request_seq start 1;

-- Requis pour que le DEFAULT (nextval) fonctionne lors d'un insert anonyme
-- depuis le formulaire public : le GRANT de table ne couvre pas les séquences.
grant usage on sequence public.service_request_seq to anon, authenticated;

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text unique not null
    default ('INV-' || lpad(nextval('public.service_request_seq')::text, 4, '0')),
  user_id uuid references public.profiles(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  organization text,
  function_title text,
  service_id uuid references public.services(id) on delete set null,
  domain_id uuid references public.domains(id) on delete set null,
  subject text not null,
  description text not null,
  budget_indicative text,
  attachment_url text,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'waiting', 'answered', 'completed', 'cancelled')),
  consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.service_requests is
  'Demandes envoyées depuis le formulaire public (Contact / "Demander ce service"). Statuts : new=Nouvelle, in_progress=En cours, waiting=En attente, answered=Répondu, completed=Terminée, cancelled=Annulée.';

create trigger set_service_requests_updated_at
before update on public.service_requests
for each row execute function public.set_updated_at();

create table public.service_request_messages (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  sender_role text not null check (sender_role in ('client', 'admin')),
  sender_id uuid references public.profiles(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

comment on table public.service_request_messages is 'Échanges entre le client et le SuperAdmin sur une demande de service.';

-- RLS

alter table public.service_requests enable row level security;

-- Formulaire public : visiteur connecté ou non peut créer une demande.
create policy "service_requests_insert_any"
on public.service_requests for insert
with check (true);

create policy "service_requests_select_own_or_superadmin"
on public.service_requests for select
using (user_id = auth.uid() or public.is_superadmin());

create policy "service_requests_update_superadmin"
on public.service_requests for update
using (public.is_superadmin());

alter table public.service_request_messages enable row level security;

create policy "service_request_messages_select"
on public.service_request_messages for select
using (
  public.is_superadmin()
  or exists (
    select 1 from public.service_requests sr
    where sr.id = service_request_id and sr.user_id = auth.uid()
  )
);

create policy "service_request_messages_insert"
on public.service_request_messages for insert
with check (
  public.is_superadmin()
  or exists (
    select 1 from public.service_requests sr
    where sr.id = service_request_id and sr.user_id = auth.uid()
  )
);
