<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { screensaverActive } from '$lib/stores/desktop';
	import type { PlaylistItem } from '$lib/types';
	import { SPOTIFY_PLAYLIST_LINK } from '$lib/config';

	let { standalone = false } = $props<{ standalone?: boolean }>();

	let playlists = $state<PlaylistItem[]>([]);
	let visibleGrid = $state<PlaylistItem[]>([]);
	let columns = $state(2);
	let rows = $state(1);
	let totalItems = $derived(columns * rows);

	const FLIP_INTERVAL = 3000;

	function rotateIn(node: HTMLElement, { duration = 700 }) {
		return {
			duration,
			css: (t: number) => {
				const rotate = (1 - t) * 180;
				return `
					transform: rotateY(${rotate}deg);
					backface-visibility: hidden;
				`;
			}
		};
	}

	function rotateOut(node: HTMLElement, { duration = 700 }) {
		return {
			duration,
			css: (t: number) => {
				const rotate = -((1 - t) * 180);
				return `
					transform: rotateY(${rotate}deg);
					backface-visibility: hidden;
				`;
			}
		};
	}

	async function fetchPlaylists() {
		try {
			const response = await fetch('/api/playlists');
			if (response.ok) {
				const data = await response.json();
				// Only use playlists that have an image
				playlists = data.filter((p: PlaylistItem) => p.imageUrl || p.imageId);
				updateGrid();
			}
		} catch (error) {
			console.error('Failed to fetch playlists for screensaver', error);
		}
	}

	function updateGridDimensions() {
		const width = window.innerWidth;
		const height = window.innerHeight;

		if (width < 640) columns = 2;
		else if (width < 1024) columns = 3;
		else if (width < 1280) columns = 4;
		else if (width < 1536) columns = 5;
		else columns = 6;

		// Calculate rows based on columns to fill the screen
		const itemWidth = width / columns;
		rows = Math.ceil(height / itemWidth);

		updateGrid();
	}

	function getNonConflictingPlaylist(index: number, currentGrid: PlaylistItem[]) {
		if (playlists.length <= 4) return playlists[Math.floor(Math.random() * playlists.length)];

		let attempts = 0;
		while (attempts < 10) {
			const candidate = playlists[Math.floor(Math.random() * playlists.length)];
			const candidateId = candidate.imageId || candidate.imageUrl;

			// Check neighbors (left, right, top, bottom)
			const neighbors = [];
			if (index % columns > 0) neighbors.push(currentGrid[index - 1]); // Left
			if (index % columns < columns - 1) neighbors.push(currentGrid[index + 1]); // Right
			if (index >= columns) neighbors.push(currentGrid[index - columns]); // Top
			if (index < totalItems - columns) neighbors.push(currentGrid[index + columns]); // Bottom

			const hasConflict = neighbors.some((n) => n && (n.imageId || n.imageUrl) === candidateId);

			if (!hasConflict) return candidate;
			attempts++;
		}

		return playlists[Math.floor(Math.random() * playlists.length)];
	}

	function updateGrid() {
		if (playlists.length === 0) return;

		const newGrid: PlaylistItem[] = [];
		for (let i = 0; i < totalItems; i++) {
			newGrid.push(getNonConflictingPlaylist(i, newGrid));
		}
		visibleGrid = newGrid;
	}

	function flipCover(index: number) {
		if (playlists.length === 0) return;
		const newPlaylist = getNonConflictingPlaylist(index, visibleGrid);
		const updatedGrid = [...visibleGrid];
		updatedGrid[index] = newPlaylist;
		visibleGrid = updatedGrid;
	}

	function flipRandomCover() {
		if (playlists.length === 0 || visibleGrid.length === 0) return;
		const randomIndex = Math.floor(Math.random() * visibleGrid.length);
		flipCover(randomIndex);
	}

	onMount(() => {
		fetchPlaylists();
		updateGridDimensions();

		window.addEventListener('resize', updateGridDimensions);

		const flipInterval = setInterval(flipRandomCover, FLIP_INTERVAL);
		const multiFlipInterval = setInterval(() => {
			if (Math.random() > 0.5) flipRandomCover();
		}, FLIP_INTERVAL * 1.4);

		return () => {
			window.removeEventListener('resize', updateGridDimensions);
			clearInterval(flipInterval);
			clearInterval(multiFlipInterval);
		};
	});

	function handleActivity() {
		if (standalone) return;
		$screensaverActive = false;
	}
</script>

<svelte:window
	onkeydown={handleActivity}
	onmousedown={handleActivity}
	ontouchstart={handleActivity}
	onmousemove={handleActivity}
/>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={standalone ? 'h-full w-full overflow-hidden bg-black' : 'fixed inset-0 z-[100] overflow-hidden bg-black'}
	transition:fade={{ duration: 1000 }}
	onclick={handleActivity}
	onkeydown={handleActivity}
>
	<div class="grid h-full w-full" style="grid-template-columns: repeat({columns}, 1fr);">
		{#each visibleGrid as playlist, i (i)}
			<div class="aspect-square w-full border border-black/10 [perspective:1000px]">
				{#key playlist.imageId || playlist.imageUrl}
					<div
						class="absolute h-full w-full [transform-style:preserve-3d]"
						in:rotateIn={{ duration: 700 }}
						out:rotateOut={{ duration: 700 }}
					>
						{#if standalone}
							<a
								href={playlist.url || SPOTIFY_PLAYLIST_LINK + playlist.uri}
								target="_blank" rel="noopener noreferrer"
								class="block h-full w-full"
							>
								<img
									src={playlist.imageUrl || `https://i.scdn.co/image/${playlist.imageId}`}
									alt={playlist.title}
									class="h-full w-full object-cover [backface-visibility:hidden]"
									onerror={() => flipCover(i)}
								/>
							</a>
						{:else}
							<img
								src={playlist.imageUrl || `https://i.scdn.co/image/${playlist.imageId}`}
								alt=""
								class="h-full w-full object-cover [backface-visibility:hidden]"
								onerror={() => flipCover(i)}
							/>
						{/if}
					</div>
				{/key}
			</div>
		{/each}
	</div>
</div>
