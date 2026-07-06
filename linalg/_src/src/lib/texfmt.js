// Helpers for building KaTeX strings with the lab's standard colors, so vectors
// in the formulas match their arrows in the coordinate plane. Compose these into
// a String.raw`...` template (they already contain literal backslashes).
import { fmt } from './math.js'

// The palette used across the whole book (kept in sync with the plane arrows).
export const C = {
  blue: '#1769ff', // î / first vector / x-part
  orange: '#e8590c', // ĵ / second vector / y-part
  green: '#12b886', // result / output
  purple: '#7c5cff', // scaled / transformed
  gray: '#adb5bd', // ghost / reference
  ink: '#1a1d24',
}

// Wrap a negative in parentheses so "1·(−0.5)" reads cleanly.
export const par = (n) => (n < 0 ? `(${fmt(n)})` : fmt(n))

// Colored LaTeX passthrough: \textcolor{color}{latex}.
export const kc = (color, latex) => String.raw`\textcolor{${color}}{${latex}}`

// Colored scalar, negatives parenthesized: \textcolor{color}{\left(−0.5\right)}.
export const knum = (color, n) =>
  String.raw`\textcolor{${color}}{${n < 0 ? `\\left(${fmt(n)}\\right)` : fmt(n)}}`

// Colored column vector from formatted numbers.
export const kcol = (color, ...entries) =>
  String.raw`\textcolor{${color}}{\begin{pmatrix} ${entries.map((e) => fmt(e)).join(String.raw` \\ `)} \end{pmatrix}}`

// Colored row vector (e.g. a transpose) from formatted numbers.
export const krow = (color, ...entries) =>
  String.raw`\textcolor{${color}}{\begin{pmatrix} ${entries.map((e) => fmt(e)).join(' & ')} \end{pmatrix}}`

// A 2×2 matrix { a, b, c, d } (column-major: col1 = a,b · col2 = c,d) as a
// KaTeX bmatrix, displayed row-major [ a c / b d ]. Optionally colored.
export const kmat = (M, color) => {
  const body = String.raw`\begin{bmatrix} ${fmt(M.a)} & ${fmt(M.c)} \\ ${fmt(M.b)} & ${fmt(M.d)} \end{bmatrix}`
  return color ? String.raw`\textcolor{${color}}{${body}}` : body
}

// Plain (uncolored) column, for when color would be noise.
export const col = (...entries) =>
  String.raw`\begin{pmatrix} ${entries.map((e) => fmt(e)).join(String.raw` \\ `)} \end{pmatrix}`
