# LinAlg Lab — an interactive intuition lab for linear algebra

A single-page React app for building **geometric intuition** in linear algebra
through interaction, not memorization. Drag vectors, scrub transformations, and
watch space deform in real time.

## Modules

1. **Matrices** — a matrix as an instruction that moves all of space; read its
   columns as the new basis vectors. Presets for rotation, scaling, shear,
   reflection, orthogonal, and rank-deficient matrices.
2. **Determinants** — signed area of the transformed unit square; sign =
   orientation; zero ⇒ collapse ⇒ not invertible. Drag the two columns directly.
3. **Decompositions** — LU and QR, stepped through factor by factor with each
   factor's geometric job shown.
4. **Projections** — the closest point on a line (a vector's "shadow"), the
   perpendicular residual, and the least-squares connection.
5. **Eigenvalues & eigenvectors** — invariant directions, eigenvalue stretch,
   and the real-vs-complex distinction (rotations have no real eigenvectors).

Every module has interactive visualizations, guided "Try it" experiments, and an
end-of-topic quiz with explanations. Progress is tracked in `localStorage`.

## Run

```bash
npm install      # already done in this checkout
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Tech

- **React 19 + Vite** — modular single-page app, one self-contained file per topic.
- **Hand-rolled SVG visualizations** (`src/components/Plane.jsx`) — a reusable
  coordinate plane with grid deformation, draggable vectors, and animated
  transitions. No heavy viz dependency.
- **`src/lib/math.js`** — all linear-algebra logic (apply, det, inverse, eigen,
  LU, QR, projection) for 2×2 matrices, kept small and readable.

## Structure

```
src/
  lib/math.js            linear-algebra helpers
  components/
    Plane.jsx            interactive SVG coordinate plane + vector primitives
    MatrixInput.jsx      editable 2x2 matrix
    Slider.jsx, Quiz.jsx, ui.jsx
  hooks/useAnimatedT.js  eased 0→1 driver for "apply transformation" animations
  modules/               one file per topic (Matrices, Determinants, ...)
  Home.jsx, App.jsx      overview + navigation shell
```
