import { defineConfig, Plugin } from 'vite';
import directoryPlugin from 'vite-plugin-directory-index';
import { entries, entriesFull, entriesFullSet } from './scripts/entries.ts';
import { resolve } from 'node:path'

//config
export default defineConfig({
	server: {
		port: 8080,
		open: true
	},
	build: {
		outDir: './dist',
		manifest: true,
		rollupOptions: {
			input: Object.fromEntries(entries.map((entry, ind) => [entry, entriesFull[ind]])),
			preserveEntrySignatures: 'allow-extension',
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'chunks/[name]-[hash].js'
			},
			external: (path, parentPath) => {
				//mark external if module import from entry
				return !!(parentPath && entriesFullSet.has(path.slice(path.indexOf('src/'))));
			},
		}
	},
	esbuild: {
		keepNames: true
	},
	plugins: [directoryPlugin(), externalResolver()]
});

//vite assumes that relative external imports are relative to the package root not dist,
//aslo it dont change extention to .js
//this changes '../[some relative dep].ts' to './[some relative dep].js'
function externalResolver (): Plugin { return {
	name: 'own:external-resolver',
	generateBundle (option, bundle) {
		for (const name in bundle) {
			const entry = bundle[name];
			if (entry.type === 'asset') continue;

			//
			entry.code = entry.code.replaceAll(/from\s*['"]([.][^'"]+)['"]/g, 
				(match, path)=> `from'${path.slice(1, -3)}.js'`
			);
		}
	}
}
}