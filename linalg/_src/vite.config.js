import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The source lives in linalg/_src (the leading underscore keeps GitHub Pages'
// Jekyll layer from publishing it). `npm run build` emits the finished app one
// level up into linalg/, which is what gets served at bit-werk.github.io/linalg/.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '..',
    // outDir sits above the project root and contains _src itself, so it must
    // never be wiped wholesale. The build script clears ../assets by hand.
    emptyOutDir: false,
  },
})
