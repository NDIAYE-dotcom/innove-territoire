-- Espace e-learning : catalogue public + salle de cours protégée.
--
-- IMPORTANT (section 20 du prompt maître) : le lien Google Meet ne doit jamais
-- être exposé publiquement. Il vit dans une table séparée (formation_meet_links)
-- avec sa propre policy, plutôt que comme colonne de `formations` — une policy
-- RLS s'applique à toute la ligne, pas colonne par colonne, donc mélanger un
-- champ sensible dans une table par ailleurs publique l'aurait exposé.

create table public.formations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  short_description text,
  full_description text,
  image_url text,
  objectives jsonb not null default '[]'::jsonb,
  target_audience text,
  prerequisites text,
  level text,
  duration text,
  start_date date,
  end_date date,
  start_time time,
  end_time time,
  seats_total integer,
  price numeric(10, 2),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  instructor_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.formations is 'Catalogue des formations (métadonnées publiques une fois publiées).';

create trigger set_formations_updated_at
before update on public.formations
for each row execute function public.set_updated_at();

create table public.formation_modules (
  id uuid primary key default gen_random_uuid(),
  formation_id uuid not null references public.formations(id) on delete cascade,
  title text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_formation_modules_updated_at
before update on public.formation_modules
for each row execute function public.set_updated_at();

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.formation_modules(id) on delete cascade,
  title text not null,
  description text,
  content text,
  video_url text,
  pdf_url text,
  external_link text,
  duration text,
  order_index integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.lessons is 'Contenu de cours — visible uniquement en salle de cours (inscription approuvée) ou par le SuperAdmin.';

create trigger set_lessons_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  formation_id uuid not null references public.formations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references public.profiles(id) on delete set null,
  unique (formation_id, user_id)
);

comment on table public.enrollments is 'Demandes d''inscription à une formation, validées par le SuperAdmin.';

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (lesson_id, user_id)
);

create table public.course_resources (
  id uuid primary key default gen_random_uuid(),
  formation_id uuid references public.formations(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null,
  file_url text not null,
  resource_type text,
  created_at timestamptz not null default now()
);

create table public.formation_meet_links (
  formation_id uuid primary key references public.formations(id) on delete cascade,
  meet_link text not null,
  updated_at timestamptz not null default now()
);

comment on table public.formation_meet_links is 'Lien Google Meet — jamais public, visible uniquement par les inscrits approuvés et le SuperAdmin.';

-- Vérifie qu'un utilisateur est inscrit ET approuvé à une formation donnée.
create or replace function public.is_enrolled(target_formation_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.enrollments e
    where e.formation_id = target_formation_id
      and e.user_id = auth.uid()
      and e.status = 'approved'
  );
$$;

-- RLS

alter table public.formations enable row level security;

create policy "formations_select_published_or_superadmin"
on public.formations for select
using (status = 'published' or public.is_superadmin());

create policy "formations_insert_superadmin"
on public.formations for insert
with check (public.is_superadmin());

create policy "formations_update_superadmin"
on public.formations for update
using (public.is_superadmin());

create policy "formations_delete_superadmin"
on public.formations for delete
using (public.is_superadmin());

alter table public.formation_modules enable row level security;

create policy "formation_modules_select"
on public.formation_modules for select
using (public.is_superadmin() or public.is_enrolled(formation_id));

create policy "formation_modules_insert_superadmin"
on public.formation_modules for insert
with check (public.is_superadmin());

create policy "formation_modules_update_superadmin"
on public.formation_modules for update
using (public.is_superadmin());

create policy "formation_modules_delete_superadmin"
on public.formation_modules for delete
using (public.is_superadmin());

alter table public.lessons enable row level security;

create policy "lessons_select"
on public.lessons for select
using (
  public.is_superadmin()
  or exists (
    select 1 from public.formation_modules m
    where m.id = module_id and public.is_enrolled(m.formation_id)
  )
);

create policy "lessons_insert_superadmin"
on public.lessons for insert
with check (public.is_superadmin());

create policy "lessons_update_superadmin"
on public.lessons for update
using (public.is_superadmin());

create policy "lessons_delete_superadmin"
on public.lessons for delete
using (public.is_superadmin());

alter table public.enrollments enable row level security;

create policy "enrollments_select_own_or_superadmin"
on public.enrollments for select
using (user_id = auth.uid() or public.is_superadmin());

create policy "enrollments_insert_own"
on public.enrollments for insert
with check (user_id = auth.uid());

create policy "enrollments_update_superadmin"
on public.enrollments for update
using (public.is_superadmin());

alter table public.lesson_progress enable row level security;

create policy "lesson_progress_select_own_or_superadmin"
on public.lesson_progress for select
using (user_id = auth.uid() or public.is_superadmin());

create policy "lesson_progress_insert_own"
on public.lesson_progress for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.lessons l
    join public.formation_modules m on m.id = l.module_id
    where l.id = lesson_id and public.is_enrolled(m.formation_id)
  )
);

create policy "lesson_progress_update_own"
on public.lesson_progress for update
using (user_id = auth.uid());

alter table public.course_resources enable row level security;

create policy "course_resources_select"
on public.course_resources for select
using (
  public.is_superadmin()
  or (formation_id is not null and public.is_enrolled(formation_id))
  or (
    lesson_id is not null
    and exists (
      select 1 from public.lessons l
      join public.formation_modules m on m.id = l.module_id
      where l.id = lesson_id and public.is_enrolled(m.formation_id)
    )
  )
);

create policy "course_resources_insert_superadmin"
on public.course_resources for insert
with check (public.is_superadmin());

create policy "course_resources_update_superadmin"
on public.course_resources for update
using (public.is_superadmin());

create policy "course_resources_delete_superadmin"
on public.course_resources for delete
using (public.is_superadmin());

alter table public.formation_meet_links enable row level security;

create policy "formation_meet_links_select"
on public.formation_meet_links for select
using (public.is_superadmin() or public.is_enrolled(formation_id));

create policy "formation_meet_links_write_superadmin"
on public.formation_meet_links for all
using (public.is_superadmin())
with check (public.is_superadmin());
