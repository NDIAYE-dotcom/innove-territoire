import { useState } from 'react'
import './ClassroomSidebar.css'

function hasQuiz(lesson) {
  return Array.isArray(lesson.quizzes) ? lesson.quizzes.length > 0 : Boolean(lesson.quizzes)
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden="true" {...props}>
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ClassroomSidebar({
  formation,
  modules,
  completedLessonIds,
  unlockedLessonIds,
  selectedLessonId,
  onSelectLesson,
  onShowOverview,
  progressPercent,
}) {
  const currentModuleId = modules.find((module) => module.lessons.some((lesson) => lesson.id === selectedLessonId))?.id
  const [expandedModuleId, setExpandedModuleId] = useState(currentModuleId ?? modules[0]?.id ?? null)

  const toggleModule = (moduleId) => {
    setExpandedModuleId((current) => (current === moduleId ? null : moduleId))
  }

  return (
    <aside className="classroom-sidebar">
      <div className="classroom-sidebar-header">
        <p className="classroom-sidebar-formation">{formation.title}</p>
        <div className="classroom-progress">
          <div className="classroom-progress-bar">
            <div className="classroom-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="classroom-progress-label">Progression : {progressPercent}%</span>
        </div>
      </div>

      <button
        type="button"
        className={`classroom-overview-link ${!selectedLessonId ? 'classroom-overview-link--active' : ''}`}
        onClick={onShowOverview}
      >
        Vue d'ensemble
      </button>

      <nav className="classroom-sidebar-nav">
        {modules.map((module, moduleIndex) => {
          const isExpanded = expandedModuleId === module.id
          const completedInModule = module.lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length
          const moduleUnlocked = module.lessons.some((lesson) => unlockedLessonIds.has(lesson.id))

          return (
            <div className={`classroom-module ${isExpanded ? 'is-expanded' : ''}`} key={module.id}>
              <button type="button" className="classroom-module-toggle" onClick={() => toggleModule(module.id)}>
                <span className="classroom-module-title">
                  {!moduleUnlocked && <LockIcon className="classroom-module-lock" />}
                  {String(moduleIndex + 1).padStart(2, '0')} — {module.title}
                </span>
                <span className="classroom-module-meta">
                  {completedInModule}/{module.lessons.length}
                  <svg className="classroom-module-chevron" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path
                      d="m6 9 6 6 6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {isExpanded && (
                <ul>
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isCompleted = completedLessonIds.has(lesson.id)
                    const isSelected = lesson.id === selectedLessonId
                    const isLocked = !unlockedLessonIds.has(lesson.id)
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          className={`classroom-lesson-link ${isSelected ? 'classroom-lesson-link--active' : ''} ${isLocked ? 'classroom-lesson-link--locked' : ''}`}
                          onClick={() => onSelectLesson(lesson.id)}
                          disabled={isLocked}
                          title={isLocked ? 'Terminez la leçon précédente (et son quiz) pour débloquer' : undefined}
                        >
                          <span className={`classroom-lesson-check ${isCompleted ? 'classroom-lesson-check--done' : ''}`}>
                            {isCompleted ? '✓' : isLocked ? <LockIcon /> : lessonIndex + 1}
                          </span>
                          <span className="classroom-lesson-label">{lesson.title}</span>
                          {hasQuiz(lesson) && !isLocked && <span className="classroom-lesson-quiz-badge">Quiz</span>}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

export default ClassroomSidebar
