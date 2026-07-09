// Copies the pipeline's generated JSON (../data) into public/data so Vite serves
// it as a static asset at /data/*.json. Run automatically before dev/build.
import { cp, mkdir, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "../../data");
const dest = resolve(here, "../public/data");

await mkdir(dest, { recursive: true });
const files = (await readdir(src)).filter((f) => f.endsWith(".json"));
for (const f of files) {
  await cp(resolve(src, f), resolve(dest, f));
}
console.log(`sync-data: copied ${files.length} file(s) -> public/data`);
