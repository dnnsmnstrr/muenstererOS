import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit()
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		fs: {
			allow: ['src', 'static', 'lib', 'config'],
		}
	},
	optimizeDeps: {
		include: ['monaco-editor']
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					'monaco-editor': ['monaco-editor']
				}
			}
		}
	}
});