<script lang="ts">
	import { Music, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import playlistData from '../../data/playlists.json';
	import { fly } from 'svelte/transition';

	interface PlaylistItem {
		title: string;
		type: 'season' | 'aggregated' | 'theme' | 'hidden';
		season?: 'winter' | 'spring' | 'summer' | 'autumn';
		year?: number;
		uri: string;
		emoji?: string;
		imageUrl?: string;
	}

	const playlists = playlistData as PlaylistItem[];
	let isExpanded = $state(false);
	
	// Get the most recent season playlist
	const currentPlaylist = playlists
		.filter((p) => p.type === 'season')
		.sort((a, b) => {
			// Sort by year, then by season order
			const seasonOrder = { winter: 0, spring: 1, summer: 2, autumn: 3 };
			if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
			const aSeason = seasonOrder[a.season || 'winter'];
			const bSeason = seasonOrder[b.season || 'winter'];
			return bSeason - aSeason;
		})[0];

	function handleClick() {
		goto('/playlists');
	}

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}
</script>

<div class="relative flex items-center">
	<!-- Toggle Button -->
	<Button
		variant="outline"
		size="icon"
		class="h-10 w-10 rounded-full shadow-lg z-10 mr-4 group"
		onclick={toggleExpanded}
		aria-label={isExpanded ? 'Hide Now Playing' : 'Show Now Playing'}
	>
		{#if isExpanded}
			<ChevronRight class="h-5 w-5" />
        {:else}
            <Music class="h-5 w-5 group-hover:hidden" />
            <ChevronLeft class="h-5 w-5 hidden group-hover:block" />
		{/if}
	</Button>

	<!-- Sliding Panel -->
	{#if isExpanded}
		<div
			transition:fly={{ x: 200, duration: 300 }}
		>
			<Card.Root
				class="group cursor-pointer overflow-hidden transition-all hover:scale-105 hover:shadow-lg mr-4"
				onclick={handleClick}
			>
				<Card.Content class="p-0 w-40 h-40">
					<div class="relative">
						{#if currentPlaylist?.imageUrl}
							<img
								src={currentPlaylist.imageUrl}
								alt={currentPlaylist.title}
								class="h-full w-full object-cover"
							/>
						{:else}
							<div
								class="flex h-32 items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500"
							>
								<Music class="h-12 w-12 text-white" />
							</div>
						{/if}
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
						></div>
						<div class="absolute bottom-0 left-0 right-0 p-3">
							<div class="flex items-center gap-2 text-white">
								<Music class="h-4 w-4" />
								<div class="flex-1 min-w-0">
									<p class="text-xs font-medium opacity-80">Now Playing</p>
									<p class="truncate text-sm font-bold">
										{currentPlaylist?.emoji || '🎵'}
										{currentPlaylist?.title || 'Loading...'}
									</p>
								</div>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</div>
