import { defineConfig } from 'vite';

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
				enable_chunk_parsing: './src/enable_chunk_parsing.ts',
			},
			preserveEntrySignatures: 'allow-extension',
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'chunks/[name]-[hash].js',
			},
		},
	},
	plugins: [],
});
