<script lang="ts">
	import Link from '$lib/components/typography/Link.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import { breakpoints, links } from '$lib/config';
	import { capitalize } from '$lib/helper';
	import TopArtists from './TopArtists.svelte';
	import playlistData from './playlists.json';
	import { Users, Info, X } from 'lucide-svelte';
	import { onMount } from 'svelte';

	interface PlaylistItem {
		title: string;
		type: 'season' | 'aggregated' | 'theme';
		season?: 'winter' | 'spring' | 'summer' | 'autumn';
		year?: number;
		uri: string;
		emoji?: string;
		description?: string;
		tags?: string[];
		gif?: string;
		imageId?: string;
		imageUrl?: string;
		isHovered?: boolean;
	}

	const SPOTIFY_PLAYLIST_LINK = 'https://open.spotify.com/playlist/';

	let showGifs = false;

	const allPlaylists = playlistData as PlaylistItem[];

	const currentPlaylist = allPlaylists[0];
	let seasonPlaylists = allPlaylists.filter((playlist) => playlist.type === 'season');
	const aggregatedPlaylists = allPlaylists.filter((playlist) => playlist.type === 'aggregated');
	const otherPlaylists = allPlaylists.filter((playlist) => playlist.type === 'theme');

	let filterQuery = '';
	const searchFilter = (playlist: PlaylistItem) => {
		if (!filterQuery) {
			return true;
		}
		const query = filterQuery.toLowerCase();
		return (
			playlist.title.toLowerCase().includes(query) ||
			playlist.description?.toLowerCase().includes(query) ||
			playlist.season?.toLowerCase().includes(query) ||
			playlist.year?.toString().includes(query)
		);
	};

	$: filteredPlaylists = filterQuery ? allPlaylists.filter(searchFilter) : seasonPlaylists;
	let showTopArtists = false;

	function createIntersectionObserver(playlist: PlaylistItem) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (window.innerWidth < breakpoints.sm) {
						playlist.isHovered = entry.isIntersecting;
					} else {
						playlist.isHovered = false;
					}
					seasonPlaylists = [...seasonPlaylists];
				});
			},
			{
				threshold: [0, 0.5, 1],
				rootMargin: '-50% 0px -50% 0px'
			}
		);
		return observer;
	}

	onMount(() => {
		const observers = new Map();

		const playlistElements = document.querySelectorAll('[data-playlist-card]');
		playlistElements.forEach((element, index) => {
			const observer = createIntersectionObserver(seasonPlaylists[index]);
			observer.observe(element);
			observers.set(element, observer);
		});

		return () => {
			observers.forEach((observer) => observer.disconnect());
		};
	});

	let selectedPlaylistUri: string | null = null;
</script>

<svelte:head>
	<title>Playlists</title>
</svelte:head>

<div class="container overflow-y-scroll p-4">
	<Dialog.Root open={showTopArtists} onOpenChange={(value) => (showTopArtists = value)}>
		<Dialog.Content showClose>
			<Dialog.Header>
				<Dialog.Title>Top Artists</Dialog.Title>
				<Dialog.Description>These were my top artists on Spotify over the years</Dialog.Description>
			</Dialog.Header>
			<TopArtists />
		</Dialog.Content>
	</Dialog.Root>
	<Dialog.Root
		open={!!selectedPlaylistUri}
		onOpenChange={(value) => !value && (selectedPlaylistUri = null)}
	>
		<Dialog.Content
			class="h-3/4 max-w-3xl overflow-hidden !rounded-3xl border-8 border-transparent bg-transparent p-0"
		>
			{#if selectedPlaylistUri}
				<iframe
					title="Playlist Preview"
					src="https://open.spotify.com/embed/playlist/{selectedPlaylistUri}"
					width="100%"
					height="100%"
					frameBorder="0"
					allowfullscreen={false}
					allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
					loading="lazy"
				></iframe>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
	<div class="mb-2 flex flex-col items-start justify-between gap-4 sm:mb-4 sm:flex-row">
		<h1 class="text-3xl font-bold">My Playlists</h1>
		<Input
			placeholder="Search playlists..."
			type="search"
			class="w-full sm:w-52"
			bind:value={filterQuery}
		/>
	</div>

	{#if filterQuery && !filteredPlaylists.length}
		<div class="text-center opacity-50">
			No matching playlists found.
			<br /><br />
			Check out my <Link href={links.spotify + '/playlists'}>Spotify profile</Link> for more playlists.
		</div>
	{/if}

	{#if filteredPlaylists.length}
		<div class="grid grid-cols-1 gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredPlaylists as playlist}
				<Card.Root data-playlist-card>
					<div class="group relative">
						<a href={SPOTIFY_PLAYLIST_LINK + playlist.uri} target="_blank">
							<Card.Content class="pt-6">
								{#if !filterQuery}
									{#if playlist.gif}
										<div class="relative">
											<img
												src={playlist.imageUrl || `https://i.scdn.co/image/${playlist.imageId}`}
												alt="Playlist cover"
												class="aspect-square w-full object-cover pb-2 transition-opacity duration-300"
												class:opacity-0={playlist.isHovered}
											/>
											<img
												src={playlist.gif}
												alt="Playlist GIF"
												class="absolute inset-0 aspect-square w-full object-cover pb-2 transition-opacity duration-300"
												class:opacity-0={!playlist.isHovered}
												on:mouseenter={() =>
													window.innerWidth >= breakpoints.sm && (playlist.isHovered = true)}
												on:mouseleave={() =>
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
							</Card.Content>
						</a>
						<button
							class="absolute right-2 top-2 rounded-full bg-background/50 p-2 backdrop-blur-sm transition-colors hover:bg-background sm:hidden sm:group-hover:block"
							on:click|stopPropagation={() => (selectedPlaylistUri = playlist.uri)}
						>
							<Info class="h-4 w-4" />
						</button>
					</div>
				</Card.Root>
			{/each}
		</div>
	{/if}

	{#if !filterQuery}
		<div class="">
			{#if aggregatedPlaylists.length}
				<h2 class="my-4 text-2xl font-semibold">Season Playlists</h2>
			{/if}
			<div class="grid grid-cols-4 gap-6">
				{#each aggregatedPlaylists as seasonPlaylist}
					<Card.Root title={seasonPlaylist.title}>
						<a href={SPOTIFY_PLAYLIST_LINK + seasonPlaylist.uri} target="_blank">
							<Card.Content class="flex items-center justify-center gap-4 p-4">
								{seasonPlaylist.emoji}
								<h2 class="hidden py-2 text-xl font-semibold md:block">
									{seasonPlaylist.title}
								</h2>
							</Card.Content>
						</a>
					</Card.Root>
				{/each}
			</div>
		</div>
		<div class="mt-12">
			{#if otherPlaylists.length}
				<div class="flex justify-between items-center">
					<h2 class="my-4 text-2xl font-semibold">Other Playlists</h2>
					<div class="flex items-center">
						<Switch bind:checked={showGifs} class="mr-2"/> <span class="opacity-70">Show GIFs</span>
					</div>
				</div>
			{/if}
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
				{#each otherPlaylists as otherPlaylist}
					<Card.Root class="min-h-[120px]">
						<a href={SPOTIFY_PLAYLIST_LINK + otherPlaylist.uri} target="_blank">
							<Card.Content class="pt-6 flex justify-between items-start">
								<div>
									<h2 class="pb-2 text-xl font-semibold">
										{otherPlaylist.title}
										{otherPlaylist.emoji}
									</h2>
									<p class="text-muted-foreground">{otherPlaylist.description}</p>
								</div>

								{#if otherPlaylist.gif}
									<img
										src={otherPlaylist.gif}
										alt="otherPlaylist GIF"
										class="w-16 aspect-square object-cover pb-2 transition-opacity duration-300"
										class:opacity-0={!showGifs}
									/>
								{/if}
							</Card.Content>
						</a>
					</Card.Root>
				{/each}
			</div>
		</div>
	{/if}

	{#if !filterQuery}
		<div class="my-8 flex w-full justify-center">
			<Button on:click={() => (showTopArtists = true)} variant="secondary">
				<Users class="mr-2 w-4" />
				Top Artists
			</Button>
		</div>
	{/if}
</div>
