import { exportedEntries, fullEntries } from "./entries.ts";
import { createBundle } from 'dts-buddy';
import { readFile, appendFile } from 'node:fs/promises';

//generate types.d.ts
await createBundle({
	output: './types.d.ts',
	modules: Object.fromEntries(exportedEntries.map((entry, ind) => [`@neocomp/full/${entry}`, fullEntries[ind]]))
});

//add support for `**.neo.html`
appendFile('./types.d.ts', '\n\n' + await readFile('./src/build/module.d.ts', 'utf-8'));