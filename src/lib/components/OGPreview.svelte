<script lang="ts">
	import WindowButtons from '$lib/components/WindowButtons.svelte';
	import { cn } from '$lib/utils/utils';
	import { backgroundTextures } from '$lib/config';
	import * as LucideIcons from 'lucide-svelte';
	import type { Component } from 'svelte';

	let props = $props<{
		title?: string;
		name?: string;
		iconName?: string;
		theme?: 'light' | 'dark';
		texture?: string;
		size?: number;
		spacing?: number;
		width?: number;
		height?: number;
		isMaximized?: boolean;
		showWindow?: boolean;
		children?: import('svelte').Snippet;
	}>();

	const title = $derived(props.title || 'muenstererOS');
	const name = $derived(props.name || title);
	const theme = $derived(props.theme || 'dark');
	const iconName = $derived(props.iconName || 'favicon');
	const texture = $derived(props.texture || 'dots');
	const size = $derived(props.size ?? 1);
	const spacing = $derived(props.spacing ?? 16);
	const width = $derived(props.width ?? 1200);
	const height = $derived(props.height ?? 630);
	const isMaximized = $derived(props.isMaximized ?? false);
	const showWindow = $derived(props.showWindow ?? true);

	const Icon = $derived((LucideIcons as any)[iconName] || LucideIcons.Info) as Component;
	const isFavicon = $derived(iconName === 'favicon');

	let bgStyle = $derived.by(() => {
		const color = theme === 'light' ? '#e5e5e5' : '#222222';
		const tex = backgroundTextures.find((t) => t.value === texture) || backgroundTextures[0];
		return tex.getStyle(color, size, spacing);
	});

	let bgColor = $derived(theme === 'light' ? 'white' : 'black');
	let windowBg = $derived(theme === 'light' ? 'white' : '#111');
	let textColor = $derived(theme === 'light' ? 'black' : 'white');
	let borderColor = $derived(theme === 'light' ? '#e5e5e5' : '#333');
</script>

<div
	class={cn('relative flex items-center justify-center overflow-hidden')}
	style="width: {width}px; height: {height}px; background-color: {bgColor}; color: {textColor};"
>
	<!-- Background Texture -->
	<div class="absolute inset-0 z-0 opacity-50" style={bgStyle}></div>

	{#if showWindow}
		<!-- Window Frame -->
		<div
			class={cn(
				'relative z-10 flex flex-col rounded-xl border shadow-2xl transition-all duration-300',
				isMaximized ? 'h-full w-full' : 'h-[80%] w-[80%]'
			)}
			style="background-color: {windowBg}; border-color: {borderColor}; background-image: linear-gradient(to bottom, transparent 0%, transparent 60%, {windowBg} 100%);"
		>
			<!-- Title Bar -->
			<div class="flex items-center border-b border-inherit p-2">
				<div class="flex-none">
					<WindowButtons />
				</div>
				<div class="flex-grow text-center">
					<span class="text-lg font-medium opacity-70">{title}</span>
				</div>
				<div class="w-24 flex-none"></div>
				<!-- Spacer to balance buttons -->
			</div>

			<!-- Content -->
			<div class="relative flex flex-grow items-center justify-center p-8">
				{#if props.children}
					{@render props.children()}
				{:else}
					<div class="flex flex-col items-center gap-6">
						<div
							class="rounded-2xl p-8"
							style="background-color: {theme === 'light'
								? 'rgba(0,0,0,0.05)'
								: 'rgba(255,255,255,0.1)'}"
						>
							{#if isFavicon}
								<img src="/favicon.ico" alt="Favicon" class="h-32 w-32 object-contain" />
							{:else}
								<Icon size={128} strokeWidth={1.5} />
							{/if}
						</div>
						<h1 class="text-6xl font-bold tracking-tight">{name}</h1>
					</div>
				{/if}

				<!-- Fade-out Overlay at the bottom -->
				<div
					class="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-current to-transparent"
					style="--tw-gradient-from: {windowBg}; color: {windowBg}"
				></div>
			</div>
		</div>
	{:else}
		<div class="relative z-10 flex h-full w-full items-center justify-center p-8">
			{#if props.children}
				{@render props.children()}
			{:else}
				<div class="flex flex-col items-center gap-6">
					{#if isFavicon}
						<img src="/favicon.ico" alt="Favicon" class="h-32 w-32 object-contain" />
					{:else}
						<Icon size={128} strokeWidth={1.5} />
					{/if}
					<h1 class="text-6xl font-bold tracking-tight">{name}</h1>
				</div>
			{/if}
		</div>
	{/if}
</div>
