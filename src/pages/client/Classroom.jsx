import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import AppLogo from '../../components/common/AppLogo'
import ClassroomSidebar from '../../components/classroom/ClassroomSidebar'
import LessonViewer from '../../components/classroom/LessonViewer'
import useAuth from '../../hooks/useAuth'
import { fetchFormationBySlug, fetchClassroomData, toggleLessonProgress } from '../../services/formationService'
import './Classroom.css'

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

      const classroom = await fetchClassroomData(formation.id, user.id)
      if (!isMounted) return

      if (classroom.error) {
        setState({ status: 'error' })
        return
      }

      const firstLesson = classroom.modules.flatMap((module) => module.lessons)[0]
      setSelectedLessonId(firstLesson?.id ?? null)
      setState({ status: 'ready', formation, ...classroom })
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
          selectedLessonId={selectedLessonId}
          onSelectLesson={setSelectedLessonId}
          progressPercent={progressPercent}
        />

        <main className="classroom-main">
          {allLessons.length === 0 ? (
            <EmptyState
              title="Le contenu de cette formation n'est pas encore disponible"
              description="Les modules et leçons seront publiés prochainement par le cabinet."
            />
          ) : (
            <LessonViewer
              lesson={selectedLesson}
              resources={lessonResources}
              isCompleted={selectedLesson ? completedLessonIds.has(selectedLesson.id) : false}
              onToggleComplete={handleToggleComplete}
              toggling={toggling}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default Classroom
