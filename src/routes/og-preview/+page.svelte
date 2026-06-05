<script lang="ts">
	import OGPreview from '$lib/components/OGPreview.svelte';
	import { page } from '$app/state';

	const title = $derived(page.url.searchParams.get('title') || 'muenstererOS');
	const icon = $derived(page.url.searchParams.get('icon') || 'Info');
	const theme = $derived((page.url.searchParams.get('theme') as 'light' | 'dark') || 'dark');
	const texture = $derived(page.url.searchParams.get('texture') || 'dots');
	const size = $derived(Number(page.url.searchParams.get('size')) || 1);
	const spacing = $derived(Number(page.url.searchParams.get('spacing')) || 16);
	const width = $derived(Number(page.url.searchParams.get('width')) || 1200);
	const height = $derived(Number(page.url.searchParams.get('height')) || 630);
</script>

<div class="flex min-h-screen items-center justify-center bg-black p-0">
	<OGPreview
		{title}
		iconName={icon}
		{theme}
		{texture}
		{size}
		{spacing}
		{width}
		{height}
	/>
</div>
