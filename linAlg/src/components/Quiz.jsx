import { useState } from 'react'

/**
 * A small quiz. `questions` is an array of:
 *   { q: string|node, options: string[], answer: index, explain: string,
 *     visual?: node }  // optional visual shown above the question
 */
export default function Quiz({ questions, title = 'Concept check' }) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[i]

  const choose = (idx) => {
    if (picked !== null) return
    setPicked(idx)
    if (idx === q.answer) setScore((s) => s + 1)
  }

  const next = () => {
    if (i + 1 >= questions.length) {
      setDone(true)
    } else {
      setI(i + 1)
      setPicked(null)
    }
  }

  const restart = () => {
    setI(0)
    setPicked(null)
    setScore(0)
    setDone(false)
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="quiz card">
        <h3>{title} — results</h3>
        <p className="quiz-score">
          You scored <b>{score}</b> / {questions.length} ({pct}%)
        </p>
        <p className="muted">
          {pct === 100
            ? 'Perfect — you have the intuition down.'
            : pct >= 60
              ? 'Good. Revisit the visualizations for the ones you missed.'
              : 'Replay the experiments above, then try again.'}
        </p>
        <button className="btn" onClick={restart}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="quiz card">
      <div className="quiz-head">
        <h3>{title}</h3>
        <span className="quiz-progress">
          {i + 1} / {questions.length}
        </span>
      </div>
      {q.visual && <div className="quiz-visual">{q.visual}</div>}
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">
        {q.options.map((opt, idx) => {
          let cls = 'quiz-opt'
          if (picked !== null) {
            if (idx === q.answer) cls += ' correct'
            else if (idx === picked) cls += ' wrong'
          }
          return (
            <button key={idx} className={cls} onClick={() => choose(idx)} disabled={picked !== null}>
              {opt}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <div className={`quiz-explain ${picked === q.answer ? 'ok' : 'no'}`}>
          <b>{picked === q.answer ? 'Correct. ' : 'Not quite. '}</b>
          {q.explain}
          <div>
            <button className="btn" onClick={next}>
              {i + 1 >= questions.length ? 'See results' : 'Next question'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
