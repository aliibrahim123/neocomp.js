import { defineConfig } from 'vite';
import directoryPlugin from 'vite-plugin-directory-index';
import { entries, fullEntries } from './scripts/entries.ts';
import { neoTempPlugin } from './src/build/plugin.ts';

//config
export default defineConfig({
	server: {
		port: 8080,
		open: true
	},
	build: {
		target: 'esnext',
		outDir: './dist',
		manifest: true,
		rollupOptions: {
			input: Object.fromEntries(entries.map((entry, ind) => [entry, fullEntries[ind]])),
			preserveEntrySignatures: 'allow-extension',
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'chunks/[name]-[hash].js'
			},
			external: ['node:path', 'node:fs/promises', 'vite']
		}
	},
	esbuild: {
		keepNames: true
	},
	plugins: [directoryPlugin()]
});