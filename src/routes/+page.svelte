<script lang="ts">
	import { WEBSITE_NAME } from '$lib/config';
	import DraggableWindow from '$lib/components/DraggableWindow.svelte';
	import { elementBoundingStore } from '@sveltelegos-blue/svelte-legos';
	import Profile from '$lib/components/Profile.svelte';
	import NowPlaying from '$lib/components/NowPlaying.svelte';
	import { initializeFiles } from '$lib/stores/desktop';
	import Dock from './Dock.svelte';
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils';

	let element: HTMLElement | null = $state(null);
	let width = $state(0);
	let height = $state(0);

	let nowPlayingY = $state(208); // Initial top-52
	let nowPlayingSide = $state<'left' | 'right'>('right');
	let isDragging = $state(false);
	let hasDragged = $state(false);
	let lastDragEndTime = 0;
	let startX = 0;
	let startY = 0;

	function handlePointerDown(e: PointerEvent) {
		isDragging = true;
		hasDragged = false;
		startX = e.clientX;
		startY = e.clientY;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;

		const dx = e.clientX - startX;
		const dy = e.clientY - startY;

		if (!hasDragged && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
			hasDragged = true;
		}

		if (hasDragged) {
			// Update Y position with clamping
			const minY = 80;
			const maxY = height - 80;
			nowPlayingY = Math.max(minY, Math.min(e.clientY, maxY));

			// Update side based on horizontal position
			if (e.clientX < width / 2) {
				nowPlayingSide = 'left';
			} else {
				nowPlayingSide = 'right';
			}
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (isDragging) {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
			if (hasDragged) {
				lastDragEndTime = Date.now();
			}
		}
		isDragging = false;
	}

	function handleClickCapture(e: MouseEvent) {
		if (hasDragged || (Date.now() - lastDragEndTime < 100)) {
			e.stopPropagation();
			e.preventDefault();
			hasDragged = false;
		}
	}

	$effect(() => {
		if (element) {
			const store = elementBoundingStore(element);
			const unsubscribe = store.subscribe((rect) => {
				width = rect.width;
				height = rect.height;
			});
			return unsubscribe;
		}
	});

	// Initialize files once on mount
	onMount(() => {
		initializeFiles();
	});
</script>

<svelte:head>
	<meta name="description" content={WEBSITE_NAME + ' Desktop'} />
</svelte:head>

<section class="h-full w-full" bind:this={element}>
	<DraggableWindow {width} {height} class="flex flex-col items-center justify-center gap-4 p-4">
		<Profile />
	</DraggableWindow>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		data-testid="now-playing-wrapper"
		class={cn(
			"fixed z-40 touch-none select-none",
			isDragging ? "cursor-grabbing" : "cursor-grab"
		)}
		style="top: {nowPlayingY}px; {nowPlayingSide}: 0; transform: translateY(-50%);"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
		onclickcapture={handleClickCapture}
	>
		<NowPlaying side={nowPlayingSide} />
	</div>

	<Dock />
</section>
