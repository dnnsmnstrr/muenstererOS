<script lang="ts">
	import { Music, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import playlistData from '../../data/playlists.json';
	import { fly, fade } from 'svelte/transition';
	import Disc from './icons/disc.svelte';
	import { cn } from '$lib/utils';
	import * as Tooltip from '$lib/components/ui/tooltip';

	interface PlaylistItem {
		title: string;
		type: 'season' | 'aggregated' | 'theme' | 'hidden';
		season?: 'winter' | 'spring' | 'summer' | 'autumn';
		year?: number;
		uri: string;
		emoji?: string;
		imageUrl?: string;
	}

	let { side = 'right', expanded = false } = $props<{ side?: 'left' | 'right', expanded?: boolean }>();

	const playlists = playlistData as PlaylistItem[];
	
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
		expanded = !expanded;
	}
</script>

<div class={cn("relative flex items-center", side === 'right' ? "flex-row-reverse" : "")}>
	{#if expanded}
		<div
			class={cn("flex items-center", side === 'right' ? "flex-row-reverse" : "")}
			in:fly={{ x: side === 'right' ? 200 : -200, duration: 300 }}
			out:fly={{ x: side === 'right' ? 200 : -200, duration: 500, delay: 0 }}
		>
			<!-- Toggle Button -->
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="outline"
							size="icon"
							class="h-10 w-10 rounded-full shadow-lg z-10 group mx-4"
							onclick={toggleExpanded}
							aria-label="Hide Now Playing"
						>
							{#if side === 'right'}
								<ChevronRight class="h-5 w-5" />
							{:else}
								<ChevronLeft class="h-5 w-5" />
							{/if}
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content side={side === 'right' ? 'left' : 'right'}>
					<p>Hide Now Playing</p>
				</Tooltip.Content>
			</Tooltip.Root>

			<!-- Playlist Card -->
			<Card.Root
				class={cn("group cursor-pointer overflow-hidden transition-all hover:scale-105 hover:shadow-lg", side === 'right' ? "ml-4" : "mr-4")}
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
						<a class="absolute bottom-0 left-0 right-0 p-3" href="/playlists" title={currentPlaylist?.title}>
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
						</a>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{:else}
		<!-- Collapsed Button -->
		<div 
			in:fade={{ duration: 300, delay: 300 }}
			out:fade={{ duration: 0 }}
		>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="outline"
							size="icon"
							class={cn("h-10 w-10 rounded-full shadow-lg z-10 mx-4")}
							onclick={toggleExpanded}
							aria-label="Show Now Playing"
						>
							<Disc />
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content side={side === 'right' ? 'left' : 'right'}>
					<p>Show Now Playing</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
	{/if}
</div>
