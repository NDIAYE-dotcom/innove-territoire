import './ClassroomSidebar.css'

function ClassroomSidebar({ formation, modules, completedLessonIds, selectedLessonId, onSelectLesson, progressPercent }) {
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

      <nav className="classroom-sidebar-nav">
        {modules.map((module) => (
          <div className="classroom-module" key={module.id}>
            <p className="classroom-module-title">{module.title}</p>
            <ul>
              {module.lessons.map((lesson) => {
                const isCompleted = completedLessonIds.has(lesson.id)
                const isSelected = lesson.id === selectedLessonId
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      className={`classroom-lesson-link ${isSelected ? 'classroom-lesson-link--active' : ''}`}
                      onClick={() => onSelectLesson(lesson.id)}
                    >
                      <span className={`classroom-lesson-check ${isCompleted ? 'classroom-lesson-check--done' : ''}`}>
                        {isCompleted ? '✓' : ''}
                      </span>
                      {lesson.title}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default ClassroomSidebar
