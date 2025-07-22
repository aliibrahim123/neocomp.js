import { exportedEntries, fullEntries } from "./entries.js";
import { createBundle } from "dts-buddy";
import { readFile, appendFile } from "node:fs/promises";
await createBundle({
  output: "./types.d.ts",
  modules: Object.fromEntries(exportedEntries.map((entry, ind) => [`@neocomp/full/${entry}`, fullEntries[ind]]))
});
appendFile("./types.d.ts", "\n\n" + await readFile("./src/build/module.d.ts", "utf-8"));
