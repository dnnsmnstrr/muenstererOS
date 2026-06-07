<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { screensaverActive } from '$lib/stores/desktop';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { Button } from '$lib/components/ui/button';
	import { mode } from 'mode-watcher';
	import { isCommandActive } from '$lib/stores/app';

	let isRebooting = $state(false);
	let isDarkMode = $derived($mode === 'dark');
	let progress = $state(0);

	function startReboot() {
		isRebooting = true;
		progress = 0;
		simulateLoading();
	}

	function simulateLoading() {
		if (progress >= 100) {
			setTimeout(() => {
				$screensaverActive = false;
				isRebooting = false;
			}, 500);
			return;
		}

		// Randomized step and delay
		const step = Math.random() * 15 + 5;
		const delay = Math.random() * 800 + 200;

		setTimeout(() => {
			progress = Math.min(100, progress + step);
			simulateLoading();
		}, delay);
	}
</script>

<svelte:window
	onkeydowncapture={(e) => {
		if (isRebooting) return;
		if (e.key === 'Enter' || e.key === ' ') {
			// Allow Enter/Space to reach the button if it's focused
			return;
		}
		$screensaverActive = false;
	}}
/>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="fixed inset-0 z-[500] flex flex-col items-center justify-center p-8 transition-colors duration-1000"
	onclick={() => {
		if (!isRebooting) $screensaverActive = false;
	}}
	style:background-color={!isRebooting
		? isDarkMode
			? 'color-mix(in srgb, hsl(var(--primary)), black 80%)'
			: 'hsl(var(--primary))'
		: 'black'}
	style:color="white"
	transition:fade={{ duration: 500 }}
>
	{#if !isRebooting}
		<div class="max-w-2xl space-y-8 text-left">
			<div class="text-8xl font-medium">:(</div>
			<h1 class="text-3xl font-light leading-tight md:text-4xl">
				{i18n.t('terminal.crash.title')}
			</h1>
			<div class="space-y-4 text-xl opacity-90">
				<p>{i18n.t('terminal.crash.message')}</p>
				<p class="font-mono text-sm uppercase opacity-70">
					0% complete
				</p>
			</div>

			<div class="flex flex-col gap-6 pt-8 md:flex-row md:items-center">
				<div class="flex-1 space-y-2">
					<p class="text-lg italic opacity-80">"{i18n.t('terminal.crash.quote')}"</p>
				</div>
				<Button
					variant="outline"
					size="lg"
					autofocus
					class="w-full bg-white font-bold text-black md:w-auto"
					onclick={(e) => {
						e.stopPropagation();
						startReboot();
					}}
				>
					{i18n.t('terminal.crash.reboot')}
				</Button>
			</div>
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center gap-8">
			<!-- Apple-style loading bar -->
			<div class="h-1.5 w-64 overflow-hidden rounded-full bg-zinc-800">
				<div
					class="h-full bg-white transition-all duration-500 ease-out"
					style="width: {progress}%"
				></div>
			</div>
		</div>
	{/if}
</div>
