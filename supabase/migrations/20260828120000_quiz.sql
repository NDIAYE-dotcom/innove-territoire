-- Quiz par leçon (QCM à choix unique, une seule tentative par client).
--
-- Contrainte de sécurité centrale : les bonnes réponses (quiz_options.is_correct)
-- ne doivent JAMAIS être lisibles par un client avant sa soumission — sinon
-- n'importe qui pourrait interroger la table directement et lire la réponse
-- avant de répondre. RLS ne peut restreindre que des LIGNES, pas des colonnes,
-- et superadmin/client partagent le même rôle Postgres "authenticated" (la
-- distinction est applicative, via profiles.role_id) — impossible donc de
-- retirer le droit SELECT sur la colonne pour "les clients" seulement.
-- Solution : `quiz_options` n'est lisible en direct que par le SuperAdmin (pour
-- le back-office). Les clients ne passent jamais par une lecture directe de
-- cette table : ils appellent `get_quiz_for_lesson` (SECURITY DEFINER) qui ne
-- renvoie jamais is_correct, puis `submit_quiz_attempt` (SECURITY DEFINER) qui
-- calcule le score côté serveur. Même schéma que `submit_service_request`
-- (20260826090000) pour la même raison structurelle.

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.lessons(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.quizzes is 'Un quiz optionnel par leçon (contrainte unique sur lesson_id).';

create trigger set_quizzes_updated_at
before update on public.quizzes
for each row execute function public.set_updated_at();

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_quiz_questions_updated_at
before update on public.quiz_questions
for each row execute function public.set_updated_at();

create table public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

comment on column public.quiz_options.is_correct is
  'Jamais exposée aux clients en lecture directe — voir commentaire en tête de fichier.';

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  submitted_at timestamptz not null default now(),
  unique (quiz_id, user_id)
);

comment on table public.quiz_attempts is
  'Une seule tentative par client et par quiz (contrainte unique) — appliqué aussi côté RPC pour un message d''erreur clair.';

create table public.quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_option_id uuid references public.quiz_options(id) on delete set null,
  is_correct boolean not null,
  correct_option_id uuid references public.quiz_options(id) on delete set null
);

comment on column public.quiz_attempt_answers.correct_option_id is
  'Copie de la bonne réponse au moment de la tentative — permet au client de revoir son résultat plus tard sans jamais avoir besoin d''un accès direct à quiz_options.is_correct.';

-- RLS

alter table public.quizzes enable row level security;

create policy "quizzes_select"
on public.quizzes for select
using (
  public.is_superadmin()
  or exists (
    select 1 from public.lessons l
    join public.formation_modules m on m.id = l.module_id
    where l.id = lesson_id and public.is_enrolled(m.formation_id)
  )
);

create policy "quizzes_write_superadmin"
on public.quizzes for all
using (public.is_superadmin())
with check (public.is_superadmin());

alter table public.quiz_questions enable row level security;

create policy "quiz_questions_select"
on public.quiz_questions for select
using (
  public.is_superadmin()
  or exists (
    select 1 from public.quizzes q
    join public.lessons l on l.id = q.lesson_id
    join public.formation_modules m on m.id = l.module_id
    where q.id = quiz_id and public.is_enrolled(m.formation_id)
  )
);

create policy "quiz_questions_write_superadmin"
on public.quiz_questions for all
using (public.is_superadmin())
with check (public.is_superadmin());

alter table public.quiz_options enable row level security;

-- Volontairement SuperAdmin uniquement, y compris en lecture — voir
-- commentaire en tête de fichier. Les clients passent par get_quiz_for_lesson.
create policy "quiz_options_superadmin_all"
on public.quiz_options for all
using (public.is_superadmin())
with check (public.is_superadmin());

alter table public.quiz_attempts enable row level security;

create policy "quiz_attempts_select_own_or_superadmin"
on public.quiz_attempts for select
using (user_id = auth.uid() or public.is_superadmin());

-- Pas de policy INSERT côté client : la création passe uniquement par
-- submit_quiz_attempt (SECURITY DEFINER), qui calcule le score côté serveur
-- et empêche une deuxième tentative — jamais un insert direct depuis le client.
create policy "quiz_attempts_superadmin_all"
on public.quiz_attempts for all
using (public.is_superadmin())
with check (public.is_superadmin());

alter table public.quiz_attempt_answers enable row level security;

create policy "quiz_attempt_answers_select_own_or_superadmin"
on public.quiz_attempt_answers for select
using (
  public.is_superadmin()
  or exists (select 1 from public.quiz_attempts a where a.id = attempt_id and a.user_id = auth.uid())
);

create policy "quiz_attempt_answers_superadmin_all"
on public.quiz_attempt_answers for all
using (public.is_superadmin())
with check (public.is_superadmin());

-- RPC : lecture du quiz par un client (sans jamais renvoyer is_correct).
create or replace function public.get_quiz_for_lesson(p_lesson_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_formation_id uuid;
  v_quiz record;
  v_result json;
begin
  select m.formation_id into v_formation_id
  from public.lessons l
  join public.formation_modules m on m.id = l.module_id
  where l.id = p_lesson_id;

  if v_formation_id is null then
    return null;
  end if;

  if not (public.is_superadmin() or public.is_enrolled(v_formation_id)) then
    raise exception 'Accès non autorisé à ce quiz.';
  end if;

  select id, title, description into v_quiz
  from public.quizzes
  where lesson_id = p_lesson_id;

  if v_quiz.id is null then
    return null;
  end if;

  select json_build_object(
    'id', v_quiz.id,
    'title', v_quiz.title,
    'description', v_quiz.description,
    'questions', coalesce((
      select json_agg(
        json_build_object(
          'id', q.id,
          'question_text', q.question_text,
          'order_index', q.order_index,
          'options', (
            select json_agg(
              json_build_object('id', o.id, 'option_text', o.option_text, 'order_index', o.order_index)
              order by o.order_index
            )
            from public.quiz_options o
            where o.question_id = q.id
          )
        )
        order by q.order_index
      )
      from public.quiz_questions q
      where q.quiz_id = v_quiz.id
    ), '[]'::json)
  ) into v_result;

  return v_result;
end;
$$;

-- RPC : soumission d'une tentative, notation côté serveur, une seule
-- tentative autorisée (contrainte unique + vérification explicite pour un
-- message d'erreur clair plutôt qu'une violation de contrainte brute).
create or replace function public.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lesson_id uuid;
  v_formation_id uuid;
  v_attempt_id uuid;
  v_score integer := 0;
  v_total integer := 0;
  v_answer jsonb;
  v_question_id uuid;
  v_selected_option_id uuid;
  v_is_correct boolean;
  v_correct_option_id uuid;
  v_results json := '[]'::json;
begin
  select lesson_id into v_lesson_id from public.quizzes where id = p_quiz_id;
  if v_lesson_id is null then
    raise exception 'Quiz introuvable.';
  end if;

  select m.formation_id into v_formation_id
  from public.lessons l
  join public.formation_modules m on m.id = l.module_id
  where l.id = v_lesson_id;

  if not public.is_enrolled(v_formation_id) then
    raise exception 'Accès non autorisé à ce quiz.';
  end if;

  if exists (select 1 from public.quiz_attempts where quiz_id = p_quiz_id and user_id = auth.uid()) then
    raise exception 'Vous avez déjà passé ce quiz.';
  end if;

  select count(*) into v_total from public.quiz_questions where quiz_id = p_quiz_id;

  insert into public.quiz_attempts (quiz_id, user_id, score, total_questions)
  values (p_quiz_id, auth.uid(), 0, v_total)
  returning id into v_attempt_id;

  for v_answer in select * from jsonb_array_elements(p_answers)
  loop
    v_question_id := (v_answer ->> 'question_id')::uuid;
    v_selected_option_id := nullif(v_answer ->> 'selected_option_id', '')::uuid;

    select coalesce(o.is_correct, false) into v_is_correct
    from public.quiz_options o
    where o.id = v_selected_option_id and o.question_id = v_question_id;

    v_is_correct := coalesce(v_is_correct, false);
    if v_is_correct then
      v_score := v_score + 1;
    end if;

    select id into v_correct_option_id
    from public.quiz_options
    where question_id = v_question_id and is_correct = true
    limit 1;

    insert into public.quiz_attempt_answers (attempt_id, question_id, selected_option_id, is_correct, correct_option_id)
    values (v_attempt_id, v_question_id, v_selected_option_id, v_is_correct, v_correct_option_id);

    v_results := v_results::jsonb || jsonb_build_array(json_build_object(
      'question_id', v_question_id,
      'selected_option_id', v_selected_option_id,
      'is_correct', v_is_correct,
      'correct_option_id', v_correct_option_id
    ));
  end loop;

  update public.quiz_attempts set score = v_score where id = v_attempt_id;

  return json_build_object('attempt_id', v_attempt_id, 'score', v_score, 'total', v_total, 'results', v_results);
end;
$$;
