import { useState } from 'react'
import Plane, { Vector } from '../components/Plane.jsx'
import MatrixInput from '../components/MatrixInput.jsx'
import Quiz from '../components/Quiz.jsx'
import Check from '../components/Check.jsx'
import { Tex } from '../components/Tex.jsx'
import { Module, Unit, Observation, Split, Formal, Btn, PresetRow, Expert } from '../components/ui.jsx'
import { apply, multiply, rotation, fmt, IDENTITY } from '../lib/math.js'

const COL = { i: '#1769ff', j: '#e8590c', A: '#7048e8', B: '#0ca678', C: '#1c7ed6' }
const cA = (s) => String.raw`\textcolor{${COL.A}}{${s}}`
const cB = (s) => String.raw`\textcolor{${COL.B}}{${s}}`
const matTex = (M) => String.raw`\begin{bmatrix} ${fmt(M.a)} & ${fmt(M.c)} \\ ${fmt(M.b)} & ${fmt(M.d)} \end{bmatrix}`
const colTex = (x, y) => String.raw`\begin{bmatrix} ${fmt(x)} \\ ${fmt(y)} \end{bmatrix}`

const PAIRS = [
  { label: 'Shear & Rotate', A: { a: 1, b: 0, c: 1, d: 1 }, B: { a: 0, b: 1, c: -1, d: 0 } },
  { label: 'Scale & Shear', A: { a: 1.5, b: 0, c: 0, d: 0.7 }, B: { a: 1, b: 0, c: 1, d: 1 } },
  { label: 'Two rotations', A: rotation(40), B: rotation(25) },
]

const matDiff = (M, N) =>
  Math.abs(M.a - N.a) + Math.abs(M.b - N.b) + Math.abs(M.c - N.c) + Math.abs(M.d - N.d)

/* The one composition widget: step through "B then A", and swap the order. */
function ComposeLab({ A, B, setA, setB }) {
  const [step, setStep] = useState(2)
  const [swap, setSwap] = useState(false)
  const first = swap ? A : B // the matrix applied first
  const second = swap ? B : A
  const product = swap ? multiply(B, A) : multiply(A, B)
  const stage = step === 0 ? IDENTITY : step === 1 ? first : product
  const firstName = swap ? 'A' : 'B'
  const secondName = swap ? 'B' : 'A'
  const prodName = swap ? 'BA' : 'AB'
  const AB = multiply(A, B)
  const BA = multiply(B, A)
  const commute = matDiff(AB, BA) < 0.02
  return (
    <Split
      visual={
        <Plane size={360} range={5} grid={stage} showGhost showUnitSquare>
          <Vector to={apply(stage, { x: 1, y: 0 })} color={COL.i} width={3.5} label="î" />
          <Vector to={apply(stage, { x: 0, y: 1 })} color={COL.j} width={3.5} label="ĵ" />
        </Plane>
      }
    >
      <p>
        Doing one linear map and then another is itself a linear map — so it must be <i>some</i> matrix.
        The convention is to write it right-to-left: <Tex>{String.raw`AB`}</Tex> means <b>do B first, then
        A</b>, because it acts on a vector as <Tex>{String.raw`(AB)\,v = A\,(B\,v)`}</Tex>.
      </p>
      <div className="seg">
        <Btn active={!swap} onClick={() => setSwap(false)}>AB (B first)</Btn>
        <Btn active={swap} onClick={() => setSwap(true)}>BA (A first)</Btn>
      </div>
      <div className="btn-row">
        <Btn active={step === 0} onClick={() => setStep(0)}>1 · start</Btn>
        <Btn active={step === 1} onClick={() => setStep(1)}>2 · after {firstName}</Btn>
        <Btn active={step === 2} onClick={() => setStep(2)}>3 · after {secondName} = {prodName}</Btn>
      </div>
      <div className="mat-pair">
        <div>
          <div className="stat-label" style={{ color: COL.A }}>A</div>
          <MatrixInput value={A} onChange={setA} columnLabels={false} />
        </div>
        <div>
          <div className="stat-label" style={{ color: COL.B }}>B</div>
          <MatrixInput value={B} onChange={setB} columnLabels={false} />
        </div>
      </div>
      <PresetRow
        presets={PAIRS.map((p) => ({ label: p.label, value: p }))}
        onPick={(p) => { setA(p.A); setB(p.B); setStep(2) }}
      />
      <div className="stat-row" style={{ marginTop: 4 }}>
        <div>
          <div className="stat-label">AB</div>
          <Tex>{matTex(AB)}</Tex>
        </div>
        <div>
          <div className="stat-label">BA</div>
          <Tex>{matTex(BA)}</Tex>
        </div>
      </div>
      <Observation>
        Step through and watch space move in stages, then jump to the single product matrix that does it
        all at once. Now flip <b>AB ↔ BA</b>:{' '}
        {commute ? (
          <>these particular matrices <b>commute</b> (AB = BA) — true for two rotations, but special.</>
        ) : (
          <>the two grids end up <b>different</b>. Order matters: <Tex>{String.raw`AB \neq BA`}</Tex> in general.</>
        )}
      </Observation>
      <Check
        prompt="In the product AB, which matrix is applied to a vector first?"
        options={['A', 'B', 'They are applied simultaneously']}
        answer={1}
        explain="(AB)v = A(Bv): the rightmost matrix B touches v first, then A acts on the result. Products read right-to-left."
      />
    </Split>
  )
}

/* The one computation widget: derive AB by columns OR by entries (row·col). */
// selectable matrix display for the product widget
const GC = { row: '#7048e8', col: '#e8590c', cell: '#12b886' }
const A3 = [[1, 2, 0], [0, 1, 1], [2, 0, 1]]
const B3 = [[1, 0, 2], [1, 1, 0], [0, 1, 1]]
const toRows = (M) => [[M.a, M.c], [M.b, M.d]]
const matmul = (P, Q) => {
  const n = P.length, inner = Q.length, m = Q[0].length
  const R = []
  for (let i = 0; i < n; i++) {
    R[i] = []
    for (let j = 0; j < m; j++) {
      let s = 0
      for (let l = 0; l < inner; l++) s += P[i][l] * Q[l][j]
      R[i][j] = s
    }
  }
  return R
}

function MatrixGrid({ rows, hi, label, onCell }) {
  const m = rows[0].length
  return (
    <div className="mgrid-wrap">
      {label && <div className="mgrid-label">{label}</div>}
      <div className="mgrid" style={{ gridTemplateColumns: `repeat(${m}, minmax(28px, auto))` }}>
        {rows.map((r, i) =>
          r.map((val, j) => {
            let cls = 'mcell'
            if (hi?.cell && hi.cell[0] === i && hi.cell[1] === j) cls += ' hi-cell'
            else if (hi?.row === i) cls += ' hi-row'
            else if (hi?.col === j) cls += ' hi-col'
            if (onCell) cls += ' clickable'
            return (
              <button key={`${i}-${j}`} className={cls} onClick={onCell ? () => onCell(i, j) : undefined}>
                {fmt(val)}
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}

function ProductCompute() {
  const [dim, setDim] = useState(2)
  const [mode, setMode] = useState('col')
  const [sel, setSel] = useState(0) // column index (col mode) | [i, j] (entry mode)

  const Ar = dim === 2 ? [[1, 1], [0, 1]] : A3
  const Br = dim === 2 ? [[0, -1], [1, 0]] : B3
  const Cr = matmul(Ar, Br)

  const reset = (mm, dd) => { setMode(mm); setDim(dd); setSel(mm === 'col' ? 0 : [0, 0]) }
  const col = mode === 'col' ? (typeof sel === 'number' ? sel : 0) : null
  const cell = mode === 'entry' ? (Array.isArray(sel) ? sel : [0, 0]) : null

  const hiA = mode === 'col' ? null : { row: cell[0] }
  const hiB = { col: mode === 'col' ? col : cell[1] }
  const hiC = mode === 'col' ? { col } : { cell }

  const onA = mode === 'entry' ? (i) => setSel([i, cell[1]]) : undefined
  const onB = mode === 'col' ? (i, j) => setSel(j) : (i, j) => setSel([cell[0], j])
  const onC = mode === 'col' ? (i, j) => setSel(j) : (i, j) => setSel([i, j])

  let result
  if (mode === 'col') {
    result = Cr.map((_, k) => (
      <div key={k}>
        c<sub>{k + 1}{col + 1}</sub> ={' '}
        {Ar[k].map((a, l) => (
          <span key={l}>
            {l > 0 && ' + '}
            {fmt(a)}·<span style={{ color: GC.col }}>{fmt(Br[l][col])}</span>
          </span>
        ))}{' '}
        = <b style={{ color: GC.cell }}>{fmt(Cr[k][col])}</b>
      </div>
    ))
  } else {
    const [i, j] = cell
    result = (
      <div>
        (AB)<sub>{i + 1}{j + 1}</sub> ={' '}
        {Ar[i].map((a, l) => (
          <span key={l}>
            {l > 0 && ' + '}
            <span style={{ color: GC.row }}>{fmt(a)}</span>·<span style={{ color: GC.col }}>{fmt(Br[l][j])}</span>
          </span>
        ))}{' '}
        = <b style={{ color: GC.cell }}>{fmt(Cr[i][j])}</b>
      </div>
    )
  }

  return (
    <Split
      visual={
        <div className="compute-box">
          <div className="seg">
            <Btn active={dim === 2} onClick={() => reset(mode, 2)}>2D · 2×2</Btn>
            <Btn active={dim === 3} onClick={() => reset(mode, 3)}>3D · 3×3</Btn>
          </div>
          <div className="seg" style={{ marginTop: 8 }}>
            <Btn active={mode === 'col'} onClick={() => reset('col', dim)}>column view</Btn>
            <Btn active={mode === 'entry'} onClick={() => reset('entry', dim)}>entry view</Btn>
          </div>
          <div className="mgrid-row">
            <MatrixGrid rows={Ar} hi={hiA} label="A" onCell={onA} />
            <span className="mgrid-op">·</span>
            <MatrixGrid rows={Br} hi={hiB} label="B" onCell={onB} />
            <span className="mgrid-op">=</span>
            <MatrixGrid rows={Cr} hi={hiC} label="AB" onCell={onC} />
          </div>
          <div className="compute-result">{result}</div>
        </div>
      }
    >
      {mode === 'col' ? (
        <p>
          <b>Column view — the geometric one.</b> Click any <b style={{ color: GC.col }}>column</b> of B or
          of the result. Column <Tex>{String.raw`j`}</Tex> of the product is simply <Tex>{String.raw`A`}</Tex>{' '}
          applied to column <Tex>{String.raw`j`}</Tex> of B — that column is where a basis vector lands
          after B, and A then moves it on. The whole highlighted output column is <i>one</i>{' '}
          matrix-times-vector product (Chapter 3).
        </p>
      ) : (
        <p>
          <b>Entry view — the computational one.</b> Click a cell of the result <b style={{ color: GC.cell }}>AB</b>.
          That entry is the <b>dot product</b> of <b style={{ color: GC.row }}>row i of A</b> with{' '}
          <b style={{ color: GC.col }}>column j of B</b> — the row·column rule from Chapter 1, lit up and
          computed below.
        </p>
      )}
      <Formal title="Conformability (the shapes must match)">
        <Tex block>{String.raw`(m \times n)\,(n \times p) = (m \times p).`}</Tex>
        The <b>inner</b> dimensions must agree (A has as many columns as B has rows); the <b>outer</b> ones
        give the product's shape. Toggle <b>2×2 ↔ 3×3</b> above — the rule is identical, only the counts
        grow.
      </Formal>
      <Check
        prompt="Column j of the product AB is computed as…"
        options={['row j of A times B', 'A applied to column j of B', 'column j of A plus column j of B']}
        answer={1}
        explain="colⱼ(AB) = A·colⱼ(B): A acts on where that basis vector lands after B. Each output column is one matrix-times-vector product."
      />
    </Split>
  )
}

export default function Compose() {
  const [A, setA] = useState({ a: 1, b: 0, c: 1, d: 1 })
  const [B, setB] = useState({ a: 0, b: 1, c: -1, d: 0 })
  return (
    <Module>
      <header className="module-head">
        <h2>4 · Matrix multiplication = composition</h2>
        <p className="lead">
          There is only one honest reason to multiply matrices: it is how you <b>compose</b> linear
          maps — do one, then another. Every rule for matrix products (the order, the row·column formula,
          even the shapes) falls out of that single idea.
        </p>
      </header>

      <Unit n="4.0" kicker="Motivation" title="Two maps, back to back">
        <p>
          We constantly chain transformations: rotate <i>then</i> scale, project <i>then</i> reflect.
          Applying a linear map <Tex>{String.raw`B`}</Tex> and then a linear map <Tex>{String.raw`A`}</Tex>{' '}
          gives a new rule <Tex>{String.raw`v \mapsto A(Bv)`}</Tex>. Is it still linear? Yes — so it is some
          matrix. <b>That matrix is the product</b> <Tex>{String.raw`AB`}</Tex>.
        </p>
        <Formal title="The composite of linear maps is linear">
          If <Tex>{String.raw`A`}</Tex> and <Tex>{String.raw`B`}</Tex> are linear, then{' '}
          <Tex>{String.raw`A(B(au+bw)) = A(a\,Bu + b\,Bw) = a\,A(Bu) + b\,A(Bw)`}</Tex>. So{' '}
          <Tex>{String.raw`v \mapsto A(Bv)`}</Tex> preserves linear combinations — it is a linear map, and
          we name its matrix <Tex>{String.raw`AB`}</Tex>.
        </Formal>
      </Unit>

      <Unit n="4.1" kicker="The idea" title="AB means &ldquo;do B, then A&rdquo;">
        <ComposeLab A={A} B={B} setA={setA} setB={setB} />
      </Unit>

      <Unit n="4.2" kicker="Computation" title="Two ways to compute the product">
        <ProductCompute />
      </Unit>

      <Unit n="4.3" kicker="Properties" title="Order, identity, and grouping">
        <p>Three facts, each a direct consequence of "composition":</p>
        <Formal title="The algebra of products">
          <ul className="tight">
            <li>
              <b>Not commutative:</b> <Tex>{String.raw`AB \neq BA`}</Tex> in general — doing B then A is not
              the same as A then B (you saw this by swapping above).
            </li>
            <li>
              <b>Associative:</b> <Tex>{String.raw`A(BC) = (AB)C`}</Tex> — chaining three maps, the grouping
              never matters, because both sides mean "do C, then B, then A".
            </li>
            <li>
              <b>Identity:</b> <Tex>{String.raw`AI = IA = A`}</Tex> — composing with the do-nothing map{' '}
              <Tex>{String.raw`I`}</Tex> changes nothing.
            </li>
          </ul>
        </Formal>
        <p className="small muted">
          Associativity is <i>why</i> we can write <Tex>{String.raw`ABC`}</Tex> with no parentheses, and it
          is exactly what makes the decompositions later in the book (LU, QR) meaningful.
        </p>
        <Check
          prompt="Matrix multiplication is associative but not commutative. Which expression is therefore always safe to write without parentheses?"
          options={['A − B', 'ABC', 'neither']}
          answer={1}
          explain="A(BC) = (AB)C, so ABC is unambiguous. But ABC ≠ CBA or any reordering — order is fixed even though grouping is free."
        />
      </Unit>

      <Unit n="4.4" kicker="Recap" title="What you can now do, and what's next">
        <Observation>
          <b>In one sentence:</b> the product AB is the single matrix that performs "do B, then A", and
          every product rule — read right-to-left, columns of AB = A·(columns of B), entries = row·column,
          shapes match on the inner dimension — is just bookkeeping for that composition.
        </Observation>
        <ul>
          <li><Tex>{String.raw`(AB)v = A(Bv)`}</Tex>: products act right-to-left.</li>
          <li><Tex>{String.raw`\operatorname{col}_j(AB) = A\,\operatorname{col}_j(B)`}</Tex>; entries are row·column dot products.</li>
          <li>Associative and has identity <Tex>{String.raw`I`}</Tex>, but <b>not</b> commutative.</li>
        </ul>
        <p>
          Next we ask a sharper question about a <i>single</i> map: how much does it stretch area, and when
          does it collapse? That number is the <b>determinant</b> — but first, Chapter 5 reads a matrix as
          a system of equations.
        </p>
        <Expert
          title="Associativity, the easy way"
          solution={
            <>
              <p>Matrices are linear maps and their product is composition. For <b>every</b> vector v:</p>
              <Tex block>{String.raw`(A(BC))\,v = A\big((BC)v\big) = A\big(B(Cv)\big),`}</Tex>
              <Tex block>{String.raw`((AB)C)\,v = (AB)(Cv) = A\big(B(Cv)\big).`}</Tex>
              <p>
                Both sides equal <Tex>{String.raw`A(B(Cv))`}</Tex> for all v. Two matrices that act identically
                on every vector are equal, so <Tex>{String.raw`A(BC) = (AB)C`}</Tex>. (Composition of functions
                is always associative; matrices simply inherit it — no index gymnastics required.)
              </p>
            </>
          }
        >
          Prove that matrix multiplication is <b>associative</b>, <Tex>{String.raw`A(BC) = (AB)C`}</Tex>, using
          the composition viewpoint rather than expanding entries.
        </Expert>
      </Unit>

      <Quiz
        title="Composition — chapter check"
        questions={[
          {
            q: 'The product AB represents…',
            options: [
              'applying A and B at the same time',
              'applying B first, then A',
              'applying A first, then B',
              'adding the two maps',
            ],
            answer: 1,
            explain: '(AB)v = A(Bv): the rightmost factor acts first. Products compose right-to-left.',
          },
          {
            q: 'Column 1 of AB equals…',
            options: [
              'A times column 1 of B',
              'row 1 of A times column 1 of B',
              'column 1 of A times column 1 of B',
              'column 1 of A plus column 1 of B',
            ],
            answer: 0,
            explain: 'col₁(AB) = A·col₁(B). Each column of the product is A applied to the corresponding column of B.',
          },
          {
            q: 'For general square matrices, AB = BA…',
            options: ['always', 'never', 'only sometimes (they generally differ)', 'only if both are zero'],
            answer: 2,
            explain: 'Order matters in general; AB ≠ BA except in special cases (e.g. two rotations, or anything with the identity).',
          },
          {
            q: 'Why can a (2×3) matrix multiply a (3×2) matrix?',
            options: [
              'Because both are small',
              'Because the inner dimensions match (3 = 3); the result is 2×2',
              'It cannot',
              'Because they are both non-square',
            ],
            answer: 1,
            explain: '(m×n)(n×p) needs the inner n’s to agree. (2×3)(3×2) → 2×2. The first map outputs into the space the second consumes.',
          },
        ]}
      />
    </Module>
  )
}
