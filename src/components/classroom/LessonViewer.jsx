import Button from '../common/Button'
import LessonQuiz from './LessonQuiz'
import './LessonViewer.css'

function isDirectVideoFile(url) {
  return /\.(mp4|webm|ogg)$/i.test(url)
}

function LessonViewer({ lesson, resources, isCompleted, onToggleComplete, toggling }) {
  if (!lesson) {
    return (
      <div className="lesson-viewer lesson-viewer--empty">
        <p>Sélectionnez une leçon dans le menu pour commencer.</p>
      </div>
    )
  }

  return (
    <div className="lesson-viewer">
      <div className="lesson-viewer-header">
        <h1>{lesson.title}</h1>
        <Button variant={isCompleted ? 'outline' : 'primary'} onClick={onToggleComplete} loading={toggling}>
          {isCompleted ? 'Marquée comme terminée ✓' : 'Marquer comme terminé'}
        </Button>
      </div>

      {lesson.description && <p className="lesson-viewer-description">{lesson.description}</p>}

      {lesson.video_url && (
        <div className="lesson-viewer-video">
          {isDirectVideoFile(lesson.video_url) ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video controls src={lesson.video_url} />
          ) : (
            <iframe src={lesson.video_url} title={lesson.title} allowFullScreen />
          )}
        </div>
      )}

      {lesson.content && (
        <div className="lesson-viewer-content">
          {lesson.content.split('\n').map((paragraph, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}

      {lesson.pdf_url && (
        <a className="lesson-viewer-resource-link" href={lesson.pdf_url} target="_blank" rel="noreferrer">
          Voir le document PDF →
        </a>
      )}

      {lesson.external_link && (
        <a className="lesson-viewer-resource-link" href={lesson.external_link} target="_blank" rel="noreferrer">
          Ouvrir la ressource externe →
        </a>
      )}

      {resources.length > 0 && (
        <div className="lesson-viewer-resources">
          <h2>Ressources</h2>
          <ul>
            {resources.map((resource) => (
              <li key={resource.id}>
                <a href={resource.file_url} target="_blank" rel="noreferrer">
                  {resource.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <LessonQuiz key={lesson.id} lessonId={lesson.id} />
    </div>
  )
}

export default LessonViewer
