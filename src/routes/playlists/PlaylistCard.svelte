<script lang="ts">
	import { preventDefault, stopPropagation } from 'svelte/legacy';

	import * as Card from '$lib/components/ui/card';
	import { breakpoints } from '$lib/config';
	import { capitalize } from '$lib/utils/index';
	import { Info } from 'lucide-svelte';
	import { SPOTIFY_PLAYLIST_LINK, type PlaylistItem } from './+page.svelte';

	interface Props {
		playlist: PlaylistItem;
		compact?: boolean;
		isHighlighted?: boolean;
		setSelectedPlaylistUri: (uri: string) => {};
	}

	let { playlist = $bindable(), compact = false, isHighlighted = false, setSelectedPlaylistUri }: Props = $props();
</script>

<Card.Root data-playlist-card class="group relative {isHighlighted ? 'ring-2 ring-primary' : ''}">
	<a href={SPOTIFY_PLAYLIST_LINK + playlist.uri} target="_blank" class="h-full">
		<Card.Content class="pt-6 h-full">
			{#if !compact}
				{#if playlist.gif}
					<div class="relative">
						<img
							src={playlist.imageUrl || `https://i.scdn.co/image/${playlist.imageId}`}
							alt="Playlist cover"
							class="aspect-square w-full rounded object-cover pb-2 transition-opacity duration-300"
							class:opacity-0={playlist.isHovered}
						/>
						<img
							src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
							data-gif-src={playlist.gif}
							data-gif-lazy
							alt="Playlist GIF"
							class="absolute inset-0 aspect-square w-full rounded object-cover pb-2 transition-opacity duration-300"
							class:opacity-0={!playlist.isHovered}
							onmouseenter={() =>
								window.innerWidth >= breakpoints.sm && (playlist.isHovered = true)}
							onmouseleave={() =>
								window.innerWidth >= breakpoints.sm && (playlist.isHovered = false)}
						/>
					</div>
				{:else}
					<img
						src={playlist.imageUrl || `https://i.scdn.co/image/${playlist.imageId}`}
						alt="No GIF available"
						class="aspect-square w-full object-cover pb-2"
					/>
				{/if}
			{/if}
			<div class="flex items-start justify-between">
				<div>
					<h2 class="pb-2 text-xl font-semibold">
						{#if playlist.emoji}
							{playlist.emoji}
						{/if}
						{playlist.title}
					</h2>
					{#if playlist.season}
						<p class="text-muted-foreground">
							{capitalize(playlist.season)} - {playlist.year || 'All Years'}
						</p>
					{/if}
					{#if playlist.description}
						<p class="text-muted-foreground">
							{playlist.description}
						</p>
					{/if}
				</div>
			</div>
		</Card.Content>
	</a>
	<button
		class="absolute right-2 top-2 rounded-full bg-background/50 p-2 backdrop-blur-sm transition-colors hover:bg-background sm:hidden sm:group-hover:block"
		class:opacity-0={!playlist.isHovered && window?.innerWidth < breakpoints.sm}
		onclick={stopPropagation(preventDefault(() => setSelectedPlaylistUri(playlist.uri)))}
	>
		<Info class="h-4 w-4" />
	</button>
</Card.Root>
