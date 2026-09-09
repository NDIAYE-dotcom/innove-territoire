import { supabase } from './supabase'

export function fetchPublishedFormations() {
  return supabase
    .from('formations')
    .select(
      'id, slug, title, short_description, image_url, level, duration, start_date, end_date, seats_total, price, status'
    )
    .eq('status', 'published')
    .order('start_date', { ascending: true, nullsFirst: false })
}

export function fetchFormationBySlug(slug) {
  return supabase.from('formations').select('*').eq('slug', slug).eq('status', 'published').single()
}

export function fetchMyEnrollments(userId) {
  return supabase
    .from('enrollments')
    .select(
      'id, status, requested_at, decided_at, formations(id, slug, title, image_url, start_date, end_date, duration)'
    )
    .eq('user_id', userId)
    .order('requested_at', { ascending: false })
}

export function fetchMyEnrollmentForFormation(userId, formationId) {
  return supabase
    .from('enrollments')
    .select('id, status, requested_at')
    .eq('user_id', userId)
    .eq('formation_id', formationId)
    .maybeSingle()
}

export function createEnrollment(userId, formationId) {
  return supabase
    .from('enrollments')
    .insert({ user_id: userId, formation_id: formationId, status: 'pending' })
    .select('id, status, requested_at')
    .single()
}

export function fetchMyLessonProgress(userId) {
  return supabase
    .from('lesson_progress')
    .select('id, lesson_id, completed_at, lessons(id, title, module_id)')
    .eq('user_id', userId)
}

export async function fetchClassroomData(formationId, userId) {
  const [modulesRes, meetRes, progressRes, resourcesRes] = await Promise.all([
    supabase
      .from('formation_modules')
      .select('id, title, description, order_index, lessons(id, title, description, content, video_url, pdf_url, external_link, duration, order_index, status)')
      .eq('formation_id', formationId)
      .order('order_index', { ascending: true }),
    supabase.from('formation_meet_links').select('meet_link').eq('formation_id', formationId).maybeSingle(),
    supabase.from('lesson_progress').select('lesson_id, completed_at').eq('user_id', userId),
    supabase.from('course_resources').select('id, lesson_id, title, file_url, resource_type').eq('formation_id', formationId),
  ])

  return {
    modules: (modulesRes.data ?? [])
      .map((module) => ({
        ...module,
        lessons: (module.lessons ?? [])
          .filter((lesson) => lesson.status === 'published')
          .sort((a, b) => a.order_index - b.order_index),
      }))
      .sort((a, b) => a.order_index - b.order_index),
    meetLink: meetRes.data?.meet_link ?? null,
    progress: progressRes.data ?? [],
    resources: resourcesRes.data ?? [],
    error: modulesRes.error || meetRes.error || progressRes.error || resourcesRes.error || null,
  }
}

export function fetchLessonResources(lessonId) {
  return supabase.from('course_resources').select('id, title, file_url, resource_type').eq('lesson_id', lessonId)
}

// Upsert (jamais delete : lesson_progress n'a pas de policy DELETE, seulement
// insert/update sur sa propre ligne) — "démarquer" repasse completed_at à null
// plutôt que de supprimer la ligne de progression.
export function toggleLessonProgress(userId, lessonId, isCompleted) {
  return supabase
    .from('lesson_progress')
    .upsert(
      { user_id: userId, lesson_id: lessonId, completed_at: isCompleted ? null : new Date().toISOString() },
      { onConflict: 'lesson_id,user_id' }
    )
}

// --- SuperAdmin : formations ---

export function fetchAllFormations() {
  return supabase
    .from('formations')
    .select('id, slug, title, status, level, start_date, end_date, seats_total, price, created_at')
    .order('created_at', { ascending: false })
}

export function fetchFormationById(id) {
  return supabase.from('formations').select('*').eq('id', id).single()
}

export function createFormation(payload) {
  return supabase.from('formations').insert(payload).select().single()
}

export function updateFormation(id, payload) {
  return supabase.from('formations').update(payload).eq('id', id).select().single()
}

export function deleteFormation(id) {
  return supabase.from('formations').delete().eq('id', id)
}

// --- SuperAdmin : modules + leçons (édition d'une formation) ---

export function fetchFormationModulesAdmin(formationId) {
  return supabase
    .from('formation_modules')
    .select('id, title, description, order_index, lessons(id, title, description, content, video_url, pdf_url, external_link, duration, order_index, status)')
    .eq('formation_id', formationId)
    .order('order_index', { ascending: true })
}

export function createModule(payload) {
  return supabase.from('formation_modules').insert(payload).select().single()
}

export function updateModule(id, payload) {
  return supabase.from('formation_modules').update(payload).eq('id', id).select().single()
}

export function deleteModule(id) {
  return supabase.from('formation_modules').delete().eq('id', id)
}

export function createLesson(payload) {
  return supabase.from('lessons').insert(payload).select().single()
}

export function updateLesson(id, payload) {
  return supabase.from('lessons').update(payload).eq('id', id).select().single()
}

export function deleteLesson(id) {
  return supabase.from('lessons').delete().eq('id', id)
}

export function fetchMeetLink(formationId) {
  return supabase.from('formation_meet_links').select('meet_link').eq('formation_id', formationId).maybeSingle()
}

export function upsertMeetLink(formationId, meetLink) {
  return supabase
    .from('formation_meet_links')
    .upsert({ formation_id: formationId, meet_link: meetLink }, { onConflict: 'formation_id' })
    .select()
    .single()
}

// --- SuperAdmin : inscriptions ---

export function fetchAllEnrollments() {
  return supabase
    .from('enrollments')
    .select('id, status, requested_at, decided_at, formations(id, title), profiles!enrollments_user_id_fkey(id, email, first_name, last_name)')
    .order('requested_at', { ascending: false })
}

export function decideEnrollment(id, status, decidedBy) {
  return supabase
    .from('enrollments')
    .update({ status, decided_at: new Date().toISOString(), decided_by: decidedBy })
    .eq('id', id)
    .select()
    .single()
}

// --- Quiz (client) ---
//
// La lecture (get_quiz_for_lesson) et la soumission (submit_quiz_attempt)
// passent par des RPC SECURITY DEFINER plutôt que des requêtes directes :
// quiz_options.is_correct n'est jamais lisible par un client (voir la
// migration 20260828120000_quiz.sql pour le détail de ce choix).

export async function fetchQuizForLesson(lessonId) {
  const { data, error } = await supabase.rpc('get_quiz_for_lesson', { p_lesson_id: lessonId })
  return { data, error }
}

export function fetchMyQuizAttempt(quizId, userId) {
  return supabase
    .from('quiz_attempts')
    .select(
      'id, score, total_questions, submitted_at, quiz_attempt_answers(question_id, selected_option_id, is_correct, correct_option_id)'
    )
    .eq('quiz_id', quizId)
    .eq('user_id', userId)
    .maybeSingle()
}

export async function submitQuizAttempt(quizId, answers) {
  const { data, error } = await supabase.rpc('submit_quiz_attempt', { p_quiz_id: quizId, p_answers: answers })
  return { data, error }
}

// --- SuperAdmin : quiz ---

export function fetchQuizForLessonAdmin(lessonId) {
  return supabase
    .from('quizzes')
    .select(
      'id, title, description, quiz_questions(id, question_text, order_index, quiz_options(id, option_text, is_correct, order_index))'
    )
    .eq('lesson_id', lessonId)
    .maybeSingle()
}

export function createQuiz(payload) {
  return supabase.from('quizzes').insert(payload).select().single()
}

export function updateQuiz(id, payload) {
  return supabase.from('quizzes').update(payload).eq('id', id).select().single()
}

export function deleteQuiz(id) {
  return supabase.from('quizzes').delete().eq('id', id)
}

export function createQuizQuestion(payload) {
  return supabase.from('quiz_questions').insert(payload).select().single()
}

export function updateQuizQuestion(id, payload) {
  return supabase.from('quiz_questions').update(payload).eq('id', id).select().single()
}

export function deleteQuizQuestion(id) {
  return supabase.from('quiz_questions').delete().eq('id', id)
}

export function createQuizOption(payload) {
  return supabase.from('quiz_options').insert(payload).select().single()
}

export function updateQuizOption(id, payload) {
  return supabase.from('quiz_options').update(payload).eq('id', id).select().single()
}

export function deleteQuizOption(id) {
  return supabase.from('quiz_options').delete().eq('id', id)
}
