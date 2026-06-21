import { defineConfig } from 'vite';

// config
export default defineConfig({
	server: {
		port: 8080,
		open: true,
	},
	build: {
		target: 'esnext',
		outDir: './dist',
		manifest: true,
		rollupOptions: {
			input: {
				'index.js': './index.js',
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
