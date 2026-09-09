-- CMS (sections/cards/paramètres administrables, Phase 10) + tables système.

create table public.site_sections (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text,
  subtitle text,
  body text,
  cta_label text,
  cta_link text,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

comment on table public.site_sections is 'Blocs de texte administrables (Hero, Présentation, CTA...) — clé stable (ex: "home_hero").';

create trigger set_site_sections_updated_at
before update on public.site_sections
for each row execute function public.set_updated_at();

create table public.site_cards (
  id uuid primary key default gen_random_uuid(),
  section_key text not null,
  title text not null,
  subtitle text,
  description text,
  image_url text,
  icon text,
  link text,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.site_cards is 'Cards génériques administrables (avantages, chiffres, actualités...) regroupées par section_key.';

create trigger set_site_cards_updated_at
before update on public.site_cards
for each row execute function public.set_updated_at();

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.site_settings is 'Paramètres généraux du site en clé/valeur (nom, logo, contact, réseaux sociaux...).';

create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  subject text,
  template text,
  status text not null default 'sent' check (status in ('sent', 'failed')),
  related_type text,
  related_id uuid,
  error_message text,
  created_at timestamptz not null default now()
);

comment on table public.email_logs is 'Écrit par les Edge Functions (service_role) — jamais par le client.';

create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

comment on table public.admin_logs is 'Journal d''activité SuperAdmin (section 46).';

-- RLS

alter table public.site_sections enable row level security;

create policy "site_sections_select_active_or_superadmin"
on public.site_sections for select
using (is_active = true or public.is_superadmin());

create policy "site_sections_write_superadmin"
on public.site_sections for all
using (public.is_superadmin())
with check (public.is_superadmin());

alter table public.site_cards enable row level security;

create policy "site_cards_select_active_or_superadmin"
on public.site_cards for select
using (is_active = true or public.is_superadmin());

create policy "site_cards_write_superadmin"
on public.site_cards for all
using (public.is_superadmin())
with check (public.is_superadmin());

alter table public.site_settings enable row level security;

create policy "site_settings_select_all"
on public.site_settings for select
using (true);

create policy "site_settings_write_superadmin"
on public.site_settings for all
using (public.is_superadmin())
with check (public.is_superadmin());

alter table public.notifications enable row level security;

create policy "notifications_select_own_or_superadmin"
on public.notifications for select
using (user_id = auth.uid() or public.is_superadmin());

create policy "notifications_update_own_or_superadmin"
on public.notifications for update
using (user_id = auth.uid() or public.is_superadmin());

create policy "notifications_insert_superadmin"
on public.notifications for insert
with check (public.is_superadmin());

alter table public.email_logs enable row level security;

create policy "email_logs_superadmin_all"
on public.email_logs for all
using (public.is_superadmin())
with check (public.is_superadmin());

alter table public.admin_logs enable row level security;

create policy "admin_logs_superadmin_all"
on public.admin_logs for all
using (public.is_superadmin())
with check (public.is_superadmin());
