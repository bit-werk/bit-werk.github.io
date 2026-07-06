import { fmt } from '../lib/math.js'

// Editable 2x2 matrix. value = { a, b, c, d } stored column-major:
//   column 1 (where î lands) = (a, b)      column 2 (where ĵ lands) = (c, d)
// Displayed row-major:
//   [ a  c ]
//   [ b  d ]
// columnLabels: labels BELOW each column (columns are landing spots).
// rowLabels: [top, bottom] labels to the RIGHT of each row (rows are the
//   x- and y-components). When given, column labels are suppressed.
export default function MatrixInput({
  value,
  onChange,
  columnLabels = true,
  rowLabels = null,
  highlight = null, // 'a' | 'b' | 'c' | 'd' — outline one entry
  step = 0.1,
  readOnly = false,
}) {
  const set = (key) => (e) => {
    const n = parseFloat(e.target.value)
    onChange?.({ ...value, [key]: Number.isFinite(n) ? n : 0 })
  }

  const Cell = ({ k }) => (
    <input
      type="number"
      step={step}
      value={fmt(value[k], 3)}
      onChange={set(k)}
      readOnly={readOnly}
      className={`matrix-cell ${highlight === k ? 'hot' : ''}`}
    />
  )

  return (
    <div className="matrix-input-wrap">
      <div className="matrix-input-row">
        <div className="matrix-input">
          <div className="bracket left" />
          <div className="matrix-grid">
            <Cell k="a" />
            <Cell k="c" />
            <Cell k="b" />
            <Cell k="d" />
          </div>
          <div className="bracket right" />
        </div>
        {rowLabels && (
          <div className="matrix-rowlabels">
            <span style={{ color: '#7048e8' }}>{rowLabels[0]}</span>
            <span style={{ color: '#1098ad' }}>{rowLabels[1]}</span>
          </div>
        )}
      </div>
      {columnLabels && !rowLabels && (
        <div className="matrix-collabels">
          <span style={{ color: '#1769ff' }}>↑ where î lands</span>
          <span style={{ color: '#e8590c' }}>↑ where ĵ lands</span>
        </div>
      )}
    </div>
  )
}
