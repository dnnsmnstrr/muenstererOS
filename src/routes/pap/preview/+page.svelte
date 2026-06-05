<script lang="ts">
	import OGPreview from '$lib/components/OGPreview.svelte';
	import { page } from '$app/state';
	import * as LucideIcons from 'lucide-svelte';
	import type { Component } from 'svelte';

	const dataParam = $derived(page.url.searchParams.get('data') || '');
	const items = $derived.by(() => {
		if (!dataParam) return [];
		try {
			const decoded = decodeURIComponent(atob(dataParam));
			return JSON.parse(decoded);
		} catch (e) {
			console.error('Failed to parse preview data', e);
			return [];
		}
	});

	const theme = $derived((page.url.searchParams.get('theme') as 'light' | 'dark') || 'dark');
</script>

<div class="flex min-h-screen items-center justify-center bg-black p-0">
	<OGPreview title="Canvas Export" {theme} width={1200} height={630}>
		<div class="relative h-full w-full overflow-hidden">
			{#each items as item}
				<div
					class="absolute"
					style="left: {item.x}px; top: {item.y}px; transform: translate(-50%, -50%) rotate({item.rotation}deg) scale({item.scale});"
				>
					{#if item.type === 'emoji'}
						<span class="text-6xl">{item.content}</span>
					{:else if item.type === 'gif'}
						<img
							src={item.content}
							alt="GIF"
							class="max-h-48 max-w-48 object-contain drop-shadow-lg"
						/>
					{:else if item.type === 'text'}
						<div
							style="font-size: {item.fontSize}px; color: {item.color}; font-weight: {item.fontWeight};"
							class="whitespace-nowrap px-2 py-1"
						>
							{item.content}
						</div>
					{:else if item.type === 'icon'}
						{@const Icon = (LucideIcons as any)[item.content] as Component}
						<div style="color: {item.color || 'currentColor'}">
							<Icon size={item.fontSize ? item.fontSize * 2 : 64} />
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</OGPreview>
</div>
