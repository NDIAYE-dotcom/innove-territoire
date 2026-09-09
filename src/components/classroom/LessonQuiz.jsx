import { useEffect, useState } from 'react'
import Button from '../common/Button'
import useAuth from '../../hooks/useAuth'
import { fetchQuizForLesson, fetchMyQuizAttempt, submitQuizAttempt } from '../../services/formationService'
import './LessonQuiz.css'

// Remonté (via key sur lessonId, côté appelant) à chaque changement de leçon —
// évite de resynchroniser quiz/tentative avec un useEffect + setState.
function LessonQuiz({ lessonId }) {
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'loading', quiz: null, attempt: null })
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchQuizForLesson(lessonId).then(({ data: quiz, error: quizError }) => {
      if (quizError || !quiz) {
        setState({ status: 'none', quiz: null, attempt: null })
        return
      }

      fetchMyQuizAttempt(quiz.id, user.id).then(({ data: attempt }) => {
        setState({ status: 'ready', quiz, attempt: attempt ?? null })
      })
    })
  }, [lessonId, user.id])

  if (state.status === 'loading') return null
  if (state.status === 'none') return null

  const { quiz, attempt } = state

  // Résultat juste après soumission (contient correct_option_id pour chaque
  // réponse) ou tentative déjà enregistrée relue plus tard (même forme,
  // stockée sur quiz_attempt_answers.correct_option_id — voir la migration).
  const results = submitResult?.results ?? attempt?.quiz_attempt_answers ?? null
  const score = submitResult?.score ?? attempt?.score
  const total = submitResult?.total ?? attempt?.total_questions

  if (results) {
    const resultByQuestion = new Map(results.map((r) => [r.question_id, r]))

    return (
      <div className="lesson-quiz">
        <h2>{quiz.title}</h2>
        <p className="lesson-quiz-score">
          Résultat : <strong>{score}</strong> / {total}
        </p>
        <div className="lesson-quiz-review">
          {quiz.questions.map((question) => {
            const result = resultByQuestion.get(question.id)
            return (
              <div key={question.id} className={`lesson-quiz-review-item ${result?.is_correct ? 'is-correct' : 'is-incorrect'}`}>
                <p className="lesson-quiz-review-question">{question.question_text}</p>
                <ul>
                  {question.options.map((option) => {
                    const wasSelected = option.id === result?.selected_option_id
                    const wasCorrectAnswer = option.id === result?.correct_option_id
                    return (
                      <li
                        key={option.id}
                        className={
                          wasCorrectAnswer ? 'is-correct-answer' : wasSelected && !wasCorrectAnswer ? 'is-wrong-answer' : ''
                        }
                      >
                        {option.option_text}
                        {wasSelected && ' (votre réponse)'}
                        {wasCorrectAnswer && !wasSelected && ' (bonne réponse)'}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const unanswered = quiz.questions.some((q) => !answers[q.id])
    if (unanswered) {
      setError('Merci de répondre à toutes les questions avant de valider.')
      return
    }

    setSubmitting(true)
    setError('')

    const payload = quiz.questions.map((q) => ({ question_id: q.id, selected_option_id: answers[q.id] }))
    const { data, error: submitError } = await submitQuizAttempt(quiz.id, payload)
    setSubmitting(false)

    if (submitError) {
      setError(
        submitError.message?.includes('déjà passé')
          ? 'Vous avez déjà passé ce quiz.'
          : "Une erreur est survenue lors de l'envoi du quiz."
      )
      return
    }

    setSubmitResult(data)
  }

  return (
    <div className="lesson-quiz">
      <h2>{quiz.title}</h2>
      {quiz.description && <p className="lesson-quiz-description">{quiz.description}</p>}

      <form onSubmit={handleSubmit}>
        {quiz.questions.map((question, index) => (
          <fieldset className="lesson-quiz-question" key={question.id}>
            <legend>
              {index + 1}. {question.question_text}
            </legend>
            {question.options.map((option) => (
              <label key={option.id} className="lesson-quiz-option">
                <input
                  type="radio"
                  name={`quiz-question-${question.id}`}
                  checked={answers[question.id] === option.id}
                  onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                />
                {option.option_text}
              </label>
            ))}
          </fieldset>
        ))}

        {error && <p className="form-error form-error--global">{error}</p>}

        <Button type="submit" variant="primary" loading={submitting}>
          Valider mes réponses
        </Button>
      </form>
    </div>
  )
}

export default LessonQuiz
