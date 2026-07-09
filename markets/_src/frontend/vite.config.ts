import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The source lives in markets/_src/frontend (the leading underscore on _src keeps
// GitHub Pages' Jekyll layer from publishing the source). `npm run build` emits the
// finished app two levels up into markets/, which is what gets served at
// bit-werk.github.io/markets/.
//
// base: "./" keeps asset/data paths relative so the built site works from that subpath.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "../../",
    // outDir sits above the project root and contains _src itself, so it must never
    // be wiped wholesale. The build script clears ../../assets and ../../data by hand.
    emptyOutDir: false,
  },
});
