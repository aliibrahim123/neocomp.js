import { defineConfig } from 'vite';

// config
export default defineConfig({
	server: {
		port: 8080,
	},
	build: {
		target: 'esnext',
		outDir: './dist',
		manifest: true,
		rollupOptions: {
			input: {
				index: './src/index.ts',
			},
			preserveEntrySignatures: 'allow-extension',
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'chunks/[name]-[hash].js',
			},
			external: ['node:path', 'node:fs/promises'],
		},
	},
	plugins: [],
});
