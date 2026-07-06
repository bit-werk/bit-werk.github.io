import { useState } from 'react'

/**
 * A lightweight inline "predict, then reveal" check used between units —
 * formative, low-stakes, one question. Encourages the learner to commit to a
 * guess before seeing the answer.
 *   prompt   – the question
 *   options  – string[]
 *   answer   – index of the correct option
 *   explain  – shown after answering
 */
export default function Check({ prompt, options, answer, explain }) {
  const [picked, setPicked] = useState(null)

  return (
    <div className="check">
      <div className="check-head">
        <span className="check-tag">Predict</span>
        <span className="check-prompt">{prompt}</span>
      </div>
      <div className="check-options">
        {options.map((opt, i) => {
          let cls = 'check-opt'
          if (picked !== null) {
            if (i === answer) cls += ' correct'
            else if (i === picked) cls += ' wrong'
          }
          return (
            <button
              key={i}
              className={cls}
              disabled={picked !== null}
              onClick={() => setPicked(i)}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <div className={`check-explain ${picked === answer ? 'ok' : 'no'}`}>
          <b>{picked === answer ? 'Yes. ' : 'Look again. '}</b>
          {explain}
        </div>
      )}
    </div>
  )
}
