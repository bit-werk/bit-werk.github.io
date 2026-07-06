// Lightweight linear-algebra helpers for the lab.
// A 2x2 matrix is stored column-major as { a, b, c, d } meaning:
//   [ a  c ]      first column  i-hat = (a, b)
//   [ b  d ]      second column j-hat = (c, d)
// Vectors are { x, y }.

export const IDENTITY = { a: 1, b: 0, c: 0, d: 1 }

export function mat(a, b, c, d) {
  return { a, b, c, d }
}

// Apply matrix M to vector v.
export function apply(M, v) {
  return {
    x: M.a * v.x + M.c * v.y,
    y: M.b * v.x + M.d * v.y,
  }
}

// Matrix product M * N (apply N first, then M).
export function multiply(M, N) {
  return {
    a: M.a * N.a + M.c * N.b,
    b: M.b * N.a + M.d * N.b,
    c: M.a * N.c + M.c * N.d,
    d: M.b * N.c + M.d * N.d,
  }
}

export function det(M) {
  return M.a * M.d - M.b * M.c
}

export function trace(M) {
  return M.a + M.d
}

export function inverse(M) {
  const D = det(M)
  if (Math.abs(D) < 1e-9) return null
  return {
    a: M.d / D,
    b: -M.b / D,
    c: -M.c / D,
    d: M.a / D,
  }
}

export function transpose(M) {
  return { a: M.a, b: M.c, c: M.b, d: M.d }
}

// Linear interpolation between identity (t=0) and M (t=1) — used for
// animating "before -> after" transformations of space.
export function lerpMat(M, t, from = IDENTITY) {
  return {
    a: from.a + (M.a - from.a) * t,
    b: from.b + (M.b - from.b) * t,
    c: from.c + (M.c - from.c) * t,
    d: from.d + (M.d - from.d) * t,
  }
}

// --- Common named matrices -------------------------------------------------

export function rotation(deg) {
  const r = (deg * Math.PI) / 180
  const cos = Math.cos(r)
  const sin = Math.sin(r)
  return { a: cos, b: sin, c: -sin, d: cos }
}

export function scaling(sx, sy) {
  return { a: sx, b: 0, c: 0, d: sy }
}

export function shear(kx, ky) {
  return { a: 1, b: ky, c: kx, d: 1 }
}

// --- Eigen-decomposition for 2x2 -------------------------------------------

const norm = (v) => Math.hypot(v.x, v.y)

export function normalize(v) {
  const n = norm(v)
  if (n < 1e-12) return { x: 0, y: 0 }
  return { x: v.x / n, y: v.y / n }
}

// Returns { real, values, vectors } for a 2x2 matrix.
// values: array of eigenvalues. When real === false they are complex
// (described by { re, im }); when real === true vectors holds unit eigenvectors.
export function eigen(M) {
  const tr = trace(M)
  const D = det(M)
  const disc = tr * tr - 4 * D
  if (disc < -1e-9) {
    const re = tr / 2
    const im = Math.sqrt(-disc) / 2
    return {
      real: false,
      values: [
        { re, im },
        { re, im: -im },
      ],
      vectors: [],
    }
  }
  const s = Math.sqrt(Math.max(disc, 0))
  const l1 = (tr + s) / 2
  const l2 = (tr - s) / 2
  const vectors = [l1, l2].map((l) => eigenvectorFor(M, l))
  return { real: true, values: [l1, l2], vectors }
}

function eigenvectorFor(M, l) {
  // Solve (M - lI) v = 0. Use the row with the larger norm for stability.
  const a = M.a - l
  const b = M.b
  const c = M.c
  const d = M.d - l
  // Row1: a x + c y = 0  -> v = (-c, a) or (c, -a)
  // Row2: b x + d y = 0  -> v = (-d, b)
  const r1 = Math.hypot(a, c)
  const r2 = Math.hypot(b, d)
  let v
  if (r1 >= r2 && r1 > 1e-9) v = { x: -c, y: a }
  else if (r2 > 1e-9) v = { x: -d, y: b }
  else v = { x: 1, y: 0 } // matrix is l*I, any vector works
  return normalize(v)
}

// --- LU decomposition (Doolittle, with the geometry kept simple) -----------
// Returns { L, U, swapped } where M = L * U (no pivoting unless forced).
export function lu(M) {
  let { a, b, c, d } = M
  let swapped = false
  // Partial pivot only if the top-left entry is ~0.
  if (Math.abs(a) < 1e-9) {
    // swap rows
    ;[a, b] = [b, a]
    ;[c, d] = [d, c]
    swapped = true
  }
  if (Math.abs(a) < 1e-9) {
    return { L: IDENTITY, U: M, swapped: false, singular: true }
  }
  const l21 = b / a
  const u22 = d - l21 * c
  const L = { a: 1, b: l21, c: 0, d: 1 }
  const U = { a, b: 0, c, d: u22 }
  return { L, U, swapped, singular: Math.abs(u22) < 1e-9 }
}

// --- QR decomposition via Gram-Schmidt -------------------------------------
// Returns { Q, R } with M = Q * R, Q orthogonal, R upper-triangular.
export function qr(M) {
  const a1 = { x: M.a, y: M.b } // first column
  const a2 = { x: M.c, y: M.d } // second column
  const r11 = norm(a1)
  if (r11 < 1e-9) return { Q: IDENTITY, R: M, singular: true }
  const q1 = { x: a1.x / r11, y: a1.y / r11 }
  const r12 = q1.x * a2.x + q1.y * a2.y
  let u2 = { x: a2.x - r12 * q1.x, y: a2.y - r12 * q1.y }
  let r22 = norm(u2)
  let q2
  if (r22 < 1e-9) {
    // Degenerate: pick a vector orthogonal to q1.
    q2 = { x: -q1.y, y: q1.x }
    r22 = 0
  } else {
    q2 = { x: u2.x / r22, y: u2.y / r22 }
  }
  const Q = { a: q1.x, b: q1.y, c: q2.x, d: q2.y }
  const R = { a: r11, b: 0, c: r12, d: r22 }
  return { Q, R, singular: r22 < 1e-9 }
}

// --- Projections -----------------------------------------------------------

export function dot(u, v) {
  return u.x * v.x + u.y * v.y
}

// Project vector v onto the line spanned by direction d.
export function projectOnto(v, d) {
  const dd = dot(d, d)
  if (dd < 1e-12) return { x: 0, y: 0 }
  const k = dot(v, d) / dd
  return { x: k * d.x, y: k * d.y }
}

// --- formatting helpers ----------------------------------------------------

export function fmt(n, p = 2) {
  if (Math.abs(n) < 1e-9) return '0'
  const r = Number(n.toFixed(p))
  return String(r)
}

export function angleOf(v) {
  return (Math.atan2(v.y, v.x) * 180) / Math.PI
}

// --- "Natural" interpolation from the identity to M ------------------------
// Naive entry-lerp (lerpMat) is geometrically wrong: a 180° rotation passes
// through the zero matrix (the whole plane collapses!). The honest path uses
// the polar decomposition M = U·P (U orthogonal, P symmetric stretch): rotate
// gradually by the true angle and grow the stretch gradually. This never
// collapses space for det(M) > 0.

function outer(v, s) {
  return { a: s * v.x * v.x, b: s * v.x * v.y, c: s * v.x * v.y, d: s * v.y * v.y }
}
function addMat(A, B) {
  return { a: A.a + B.a, b: A.b + B.b, c: A.c + B.c, d: A.d + B.d }
}

// Square root and inverse-square-root of a symmetric PSD 2x2 matrix.
function symSqrt(C) {
  const E = eigen(C) // symmetric ⇒ real eigenvalues, orthonormal eigenvectors
  const l1 = Math.max(E.values[0], 0)
  const l2 = Math.max(E.values[1], 0)
  if (Math.abs(l1 - l2) < 1e-7) {
    // C is a scalar multiple of I — eigenvectors are ambiguous, handle directly.
    const s = Math.sqrt((l1 + l2) / 2)
    const si = s > 1e-9 ? 1 / s : 0
    return { P: scaleMat(IDENTITY, s), Pinv: scaleMat(IDENTITY, si) }
  }
  const [v1, v2] = E.vectors
  const s1 = Math.sqrt(l1)
  const s2 = Math.sqrt(l2)
  const P = addMat(outer(v1, s1), outer(v2, s2))
  const Pinv = addMat(outer(v1, s1 > 1e-9 ? 1 / s1 : 0), outer(v2, s2 > 1e-9 ? 1 / s2 : 0))
  return { P, Pinv }
}

function scaleMat(M, s) {
  return { a: M.a * s, b: M.b * s, c: M.c * s, d: M.d * s }
}

// Polar decomposition M = U · P.
export function polar(M) {
  const C = multiply(transpose(M), M)
  const { P, Pinv } = symSqrt(C)
  const U = multiply(M, Pinv)
  return { U, P }
}

// Interpolated matrix at parameter t in [0,1] taking the geometrically
// honest path from I (t=0) to M (t=1).
export function naturalPath(M, t) {
  const D = det(M)
  if (Math.abs(D) < 1e-6) return lerpMat(M, t) // singular: nothing better to do
  const { U, P } = polar(M)
  if (det(U) < 0) return lerpMat(M, t) // a reflection cannot be reached by rotation
  const phi = (Math.atan2(U.b, U.a) * 180) / Math.PI
  const Ut = rotation(phi * t)
  const Pt = lerpMat(P, t, IDENTITY)
  return multiply(Ut, Pt)
}

// Does M reverse orientation (so no continuous rot-stretch path exists)?
export function isReflection(M) {
  return det(M) < -1e-9
}
