import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import AppLogo from '../../components/common/AppLogo'
import ClassroomSidebar from '../../components/classroom/ClassroomSidebar'
import ClassroomOverview from '../../components/classroom/ClassroomOverview'
import LessonViewer from '../../components/classroom/LessonViewer'
import useAuth from '../../hooks/useAuth'
import {
  fetchFormationBySlug,
  fetchClassroomData,
  fetchMyQuizAttempts,
  toggleLessonProgress,
} from '../../services/formationService'
import './Classroom.css'

// `lesson.quizzes` peut être un objet (relation to-one détectée par
// PostgREST via la contrainte unique sur lesson_id) ou un tableau selon les
// cas — on gère les deux pour rester robuste.
function getQuizId(lesson) {
  const quiz = lesson.quizzes
  if (!quiz) return null
  return Array.isArray(quiz) ? (quiz[0]?.id ?? null) : (quiz.id ?? null)
}

function Classroom() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'loading' })
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function load() {
      const { data: formation, error: formationError } = await fetchFormationBySlug(slug)
      if (!isMounted) return

      if (formationError || !formation) {
        setState({ status: 'error' })
        return
      }

      const [classroom, attemptsRes] = await Promise.all([
        fetchClassroomData(formation.id, user.id),
        fetchMyQuizAttempts(user.id),
      ])
      if (!isMounted) return

      if (classroom.error) {
        setState({ status: 'error' })
        return
      }

      // Démarre sur la vue d'ensemble plutôt que sur la Leçon 1 directement —
      // retour utilisateur : l'apprenant tombait dans le contenu sans contexte
      // ni repères sur la structure du cours.
      setState({ status: 'ready', formation, quizAttempts: attemptsRes.data ?? [], ...classroom })
    }

    load()

    return () => {
      isMounted = false
    }
  }, [slug, user])

  const completedLessonIds = useMemo(() => {
    if (state.status !== 'ready') return new Set()
    return new Set(state.progress.filter((entry) => entry.completed_at).map((entry) => entry.lesson_id))
  }, [state])

  const allLessons = useMemo(() => {
    if (state.status !== 'ready') return []
    return state.modules.flatMap((module) => module.lessons)
  }, [state])

  const selectedLesson = allLessons.find((lesson) => lesson.id === selectedLessonId) ?? null

  const progressPercent = allLessons.length
    ? Math.round((completedLessonIds.size / allLessons.length) * 100)
    : 0

  // Progression séquentielle demandée par le cabinet : une leçon ne se
  // débloque qu'une fois la précédente marquée terminée ET son quiz (s'il en
  // a un) validé — la leçon 1 est toujours accessible. "Validé" signifie ici
  // "une tentative a été soumise" (une seule tentative est autorisée, il n'y
  // a pas de seuil de score défini pour ce module).
  const attemptedQuizIds = useMemo(() => {
    if (state.status !== 'ready') return new Set()
    return new Set((state.quizAttempts ?? []).map((attempt) => attempt.quiz_id))
  }, [state])

  const unlockedLessonIds = useMemo(() => {
    const unlocked = new Set()
    allLessons.forEach((lesson, index) => {
      if (index === 0) {
        unlocked.add(lesson.id)
        return
      }
      const previous = allLessons[index - 1]
      const previousCompleted = completedLessonIds.has(previous.id)
      const previousQuizId = getQuizId(previous)
      const previousQuizDone = !previousQuizId || attemptedQuizIds.has(previousQuizId)
      if (previousCompleted && previousQuizDone) {
        unlocked.add(lesson.id)
      }
    })
    return unlocked
  }, [allLessons, completedLessonIds, attemptedQuizIds])

  const handleSelectLesson = (lessonId) => {
    if (unlockedLessonIds.has(lessonId)) {
      setSelectedLessonId(lessonId)
    }
  }

  const handleToggleComplete = async () => {
    if (!selectedLesson || toggling) return
    setToggling(true)

    const isCompleted = completedLessonIds.has(selectedLesson.id)
    const { error } = await toggleLessonProgress(user.id, selectedLesson.id, isCompleted)

    if (!error) {
      setState((current) => {
        const withoutLesson = current.progress.filter((entry) => entry.lesson_id !== selectedLesson.id)
        return {
          ...current,
          progress: isCompleted
            ? [...withoutLesson, { lesson_id: selectedLesson.id, completed_at: null }]
            : [...withoutLesson, { lesson_id: selectedLesson.id, completed_at: new Date().toISOString() }],
        }
      })
    }

    setToggling(false)
  }

  const handleQuizSubmitted = (quizId) => {
    setState((current) => ({ ...current, quizAttempts: [...(current.quizAttempts ?? []), { quiz_id: quizId }] }))
  }

  if (state.status === 'loading') {
    return <Loader fullPage label="Chargement de la salle de cours..." />
  }

  if (state.status === 'error') {
    return (
      <div className="section">
        <div className="container">
          <ErrorState onRetry={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  const lessonResources = state.resources.filter((resource) => resource.lesson_id === selectedLesson?.id)
  const selectedModule = selectedLesson
    ? state.modules.find((module) => module.lessons.some((lesson) => lesson.id === selectedLesson.id))
    : null
  const selectedLessonNumber = selectedModule
    ? selectedModule.lessons.findIndex((lesson) => lesson.id === selectedLesson.id) + 1
    : null

  return (
    <div className="classroom">
      <header className="classroom-header">
        <AppLogo />
        <Link to="/client/formations" className="classroom-header-back">
          ← Mes formations
        </Link>
        {state.meetLink && (
          <a href={state.meetLink} target="_blank" rel="noreferrer" className="classroom-header-meet">
            Rejoindre la session Meet
          </a>
        )}
      </header>

      <div className="classroom-body">
        <ClassroomSidebar
          formation={state.formation}
          modules={state.modules}
          completedLessonIds={completedLessonIds}
          unlockedLessonIds={unlockedLessonIds}
          selectedLessonId={selectedLessonId}
          onSelectLesson={handleSelectLesson}
          onShowOverview={() => setSelectedLessonId(null)}
          progressPercent={progressPercent}
        />

        <main className="classroom-main">
          {allLessons.length === 0 ? (
            <EmptyState
              title="Le contenu de cette formation n'est pas encore disponible"
              description="Les modules et leçons seront publiés prochainement par le cabinet."
            />
          ) : !selectedLesson ? (
            <ClassroomOverview
              formation={state.formation}
              modules={state.modules}
              totalLessons={allLessons.length}
              completedCount={completedLessonIds.size}
              meetLink={state.meetLink}
              unlockedLessonIds={unlockedLessonIds}
              onStart={() => setSelectedLessonId(allLessons[0].id)}
            />
          ) : (
            <LessonViewer
              lesson={selectedLesson}
              moduleTitle={selectedModule?.title}
              lessonNumber={selectedLessonNumber}
              resources={lessonResources}
              isCompleted={selectedLesson ? completedLessonIds.has(selectedLesson.id) : false}
              onToggleComplete={handleToggleComplete}
              onQuizSubmitted={handleQuizSubmitted}
              toggling={toggling}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default Classroom
