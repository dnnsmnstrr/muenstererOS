import type { Component } from 'svelte';
const components = import.meta.glob<{ default: Component }>('./examples/*.svelte', { eager: true });
const sources = import.meta.glob<string>('./examples/*.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
});
export const examples = Object.entries(components).map(([path, module]) => ({
	id: path.split('/').pop()!.replace('.svelte', '').toLowerCase(),
	component: module.default,
	source: sources[path].trim()
}));
