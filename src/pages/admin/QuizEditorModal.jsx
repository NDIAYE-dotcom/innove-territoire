import { useEffect, useState } from 'react'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import ConfirmModal from '../../components/common/ConfirmModal'
import {
  fetchQuizForLessonAdmin,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  createQuizOption,
  updateQuizOption,
  deleteQuizOption,
} from '../../services/formationService'
import './QuizEditorModal.css'

function QuizEditorModal({ isOpen, onClose, lessonId, lessonTitle }) {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingDeleteQuiz, setPendingDeleteQuiz] = useState(false)
  const [pendingDeleteQuestion, setPendingDeleteQuestion] = useState(null)

  const load = () => {
    fetchQuizForLessonAdmin(lessonId).then(({ data }) => {
      setQuiz(
        data
          ? { ...data, quiz_questions: (data.quiz_questions ?? []).sort((a, b) => a.order_index - b.order_index) }
          : null
      )
      setLoading(false)
    })
  }

  useEffect(load, [lessonId])

  const handleCreateQuiz = async (event) => {
    event.preventDefault()
    const title = event.target.elements.new_quiz_title.value.trim()
    if (!title) return
    await createQuiz({ lesson_id: lessonId, title })
    load()
  }

  const handleQuizFieldBlur = async (field, value) => {
    if (value === quiz[field]) return
    await updateQuiz(quiz.id, { [field]: value })
  }

  const handleDeleteQuiz = async () => {
    await deleteQuiz(quiz.id)
    setPendingDeleteQuiz(false)
    setQuiz(null)
  }

  const handleAddQuestion = async () => {
    await createQuizQuestion({
      quiz_id: quiz.id,
      question_text: 'Nouvelle question',
      order_index: quiz.quiz_questions.length,
    })
    load()
  }

  const handleQuestionTextBlur = async (question, value) => {
    if (value === question.question_text || !value.trim()) return
    await updateQuizQuestion(question.id, { question_text: value })
    load()
  }

  const handleDeleteQuestion = async () => {
    await deleteQuizQuestion(pendingDeleteQuestion.id)
    setPendingDeleteQuestion(null)
    load()
  }

  const handleAddOption = async (question) => {
    await createQuizOption({
      question_id: question.id,
      option_text: 'Nouvelle option',
      order_index: question.quiz_options.length,
    })
    load()
  }

  const handleOptionTextBlur = async (option, value) => {
    if (value === option.option_text || !value.trim()) return
    await updateQuizOption(option.id, { option_text: value })
    load()
  }

  const handleDeleteOption = async (option) => {
    await deleteQuizOption(option.id)
    load()
  }

  // Une seule bonne réponse par question : marquer une option correcte
  // démarque explicitement les autres (pas de contrainte DB pour ça, gérée ici).
  const handleMarkCorrect = async (question, option) => {
    const previouslyCorrect = question.quiz_options.find((o) => o.is_correct && o.id !== option.id)
    await Promise.all([
      updateQuizOption(option.id, { is_correct: true }),
      previouslyCorrect ? updateQuizOption(previouslyCorrect.id, { is_correct: false }) : Promise.resolve(),
    ])
    load()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Quiz — ${lessonTitle}`} size="lg">
      {loading ? (
        <Loader label="Chargement..." />
      ) : !quiz ? (
        <form className="admin-form" onSubmit={handleCreateQuiz}>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
            Aucun quiz pour cette leçon. Créez-en un pour ajouter des questions à choix unique.
          </p>
          <div>
            <label htmlFor="new_quiz_title">Titre du quiz</label>
            <input id="new_quiz_title" name="new_quiz_title" placeholder="Quiz de validation" required />
          </div>
          <div className="admin-form-actions">
            <Button type="submit" variant="primary">
              Créer le quiz
            </Button>
          </div>
        </form>
      ) : (
        <div className="admin-form">
          <div className="admin-form-row">
            <div>
              <label htmlFor="quiz_title">Titre</label>
              <input
                id="quiz_title"
                defaultValue={quiz.title}
                onBlur={(event) => handleQuizFieldBlur('title', event.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="quiz_description">Description (optionnelle)</label>
            <textarea
              id="quiz_description"
              defaultValue={quiz.description || ''}
              rows={2}
              onBlur={(event) => handleQuizFieldBlur('description', event.target.value)}
            />
          </div>

          {quiz.quiz_questions.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Aucune question pour l'instant.</p>
          ) : (
            <div className="quiz-question-list">
              {quiz.quiz_questions.map((question, qIndex) => (
                <div className="quiz-question-card" key={question.id}>
                  <div className="quiz-question-card-header">
                    <span className="quiz-question-number">Q{qIndex + 1}</span>
                    <input
                      className="quiz-question-input"
                      defaultValue={question.question_text}
                      onBlur={(event) => handleQuestionTextBlur(question, event.target.value)}
                    />
                    <button
                      type="button"
                      className="admin-link-action admin-link-action--danger"
                      onClick={() => setPendingDeleteQuestion(question)}
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="quiz-option-list">
                    {(question.quiz_options ?? [])
                      .slice()
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((option) => (
                        <div className="quiz-option-row" key={option.id}>
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={option.is_correct}
                            onChange={() => handleMarkCorrect(question, option)}
                            title="Marquer comme bonne réponse"
                          />
                          <input
                            className="quiz-option-input"
                            defaultValue={option.option_text}
                            onBlur={(event) => handleOptionTextBlur(option, event.target.value)}
                          />
                          <button
                            type="button"
                            className="admin-link-action admin-link-action--danger"
                            onClick={() => handleDeleteOption(option)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                  </div>
                  <button type="button" className="admin-link-action" onClick={() => handleAddOption(question)}>
                    + Option
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="admin-form-actions" style={{ justifyContent: 'space-between' }}>
            <button type="button" className="admin-link-action admin-link-action--danger" onClick={() => setPendingDeleteQuiz(true)}>
              Supprimer le quiz
            </button>
            <Button type="button" variant="outline" size="sm" onClick={handleAddQuestion}>
              + Ajouter une question
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={pendingDeleteQuiz}
        onClose={() => setPendingDeleteQuiz(false)}
        onConfirm={handleDeleteQuiz}
        title="Supprimer ce quiz ?"
        description="Toutes ses questions et les tentatives des clients seront supprimées définitivement."
        confirmLabel="Supprimer"
      />

      <ConfirmModal
        isOpen={Boolean(pendingDeleteQuestion)}
        onClose={() => setPendingDeleteQuestion(null)}
        onConfirm={handleDeleteQuestion}
        title="Supprimer cette question ?"
        confirmLabel="Supprimer"
      />
    </Modal>
  )
}

export default QuizEditorModal
