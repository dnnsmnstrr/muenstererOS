import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { execSync } from 'child_process';

const commitCount = execSync('git rev-list --count HEAD').toString().trim();
const buildTime = new Date().toISOString();

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__COMMIT_COUNT__: JSON.stringify(commitCount),
		__BUILD_TIME__: JSON.stringify(buildTime)
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		fs: {
			allow: ['src', 'static', 'lib', 'config']
		}
	}
});
