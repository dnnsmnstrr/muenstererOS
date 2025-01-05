<script context="module" lang="ts">
	export interface PlaylistItem {
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
	export const SPOTIFY_PLAYLIST_LINK = 'https://open.spotify.com/playlist/';
</script>

<script lang="ts">
	import { Heading } from '$lib/components/typography';

	import Link from '$lib/components/typography/Link.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import { breakpoints, links } from '$lib/config';
	import PlaylistCard from './PlaylistCard.svelte';
	import TopArtists from './TopArtists.svelte';
	import playlistData from './playlists.json';
	import { Users, Info, X } from 'lucide-svelte';
	import { onMount } from 'svelte';


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

	function createGifObserver(element: HTMLImageElement, gifSrc: string) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						element.src = gifSrc;
						observer.disconnect();
					}
				});
			},
			{ rootMargin: '50px' }
		);
		observer.observe(element);
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

		const gifElements = document.querySelectorAll('[data-gif-lazy]');
		gifElements.forEach((element) => {
			const gifSrc = element.getAttribute('data-gif-src');
			if (gifSrc) {
				const observer = createGifObserver(element as HTMLImageElement, gifSrc);
				observers.set(element, observer);
			}
		});

		return () => {
			observers.forEach((observer) => observer.disconnect());
		};
	});

	let selectedPlaylistUri: string | null = null;

	let shuffleEmoji: string = '';
	let shuffleInterval: number;
	let selectedPlaylist: PlaylistItem | null = null;

	function getPlaylistEmojis() {
		return allPlaylists
			.flatMap(p => p.emoji ? [...new Intl.Segmenter().segment(p.emoji)].map(segment => segment.segment) : [])
			.filter((emoji): emoji is string => emoji !== undefined);
	}

	function shuffleAndPick() {
		const emojis = getPlaylistEmojis();
		shuffleEmoji = '🎲';
		let count = 0;
		
		shuffleInterval = window.setInterval(() => {
			count++;
			shuffleEmoji = emojis[Math.floor(Math.random() * emojis.length)];
			
			if (count > 10) {
				clearInterval(shuffleInterval);
				selectedPlaylist = allPlaylists[Math.floor(Math.random() * allPlaylists.length)];
				if (selectedPlaylist.emoji) {
					const firstEmoji = [...new Intl.Segmenter().segment(selectedPlaylist.emoji)].map(segment => segment.segment).pop();
					shuffleEmoji = firstEmoji || '🎲';
				}
				setTimeout(() => {
					const url = SPOTIFY_PLAYLIST_LINK + selectedPlaylist?.uri;
					if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
						window.open(url, '_self');
					} else {
						window.open(url, '_blank', 'noopener,noreferrer');
					}
					shuffleEmoji = '';
				}, 500);
			}
		}, 100);
	}
</script>

<svelte:head>
	<title>Playlists</title>
</svelte:head>

<div class="container">
	<Dialog.Root open={showTopArtists} onOpenChange={(value) => (showTopArtists = value)}>
		<Dialog.Content>
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
			showClose={false}
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
	<Dialog.Root 
		open={!!shuffleEmoji} 
		onOpenChange={(value) => {
			if (!value) {
				shuffleEmoji = '';
				clearInterval(shuffleInterval);
			}
		}}
	>
		<Dialog.Content class="max-w-[120px]" showClose={false}>
			<div class="flex min-h-[100px] items-center justify-center text-6xl">
				{shuffleEmoji}
			</div>
		</Dialog.Content>
	</Dialog.Root>

	<div class="mb-4 flex flex-col items-start sm:items-center justify-between gap-4 sm:mb-6 sm:flex-row">
		<Heading class="mb-0">My Playlists</Heading>
		<div class="flex w-full gap-2 sm:w-auto">
			<Button
				title="I'm feeling lucky"
				variant="outline"
				size="icon"
				class="shrink-0"
				on:click={shuffleAndPick}
			>
				🎲
			</Button>
			<Input
				placeholder="Search playlists..."
				type="search"
				class="w-full text-base sm:w-52"
				bind:value={filterQuery}
			/>
		</div>
	</div>

	{#if filterQuery && !filteredPlaylists.length}
		<div class="text-center opacity-50">
			No matching playlists found.
			<br /><br />
			Check out my <Link href={links.spotify + '/playlists'}>Spotify profile</Link> for more playlists.
		</div>
	{/if}

	{#if filteredPlaylists.length}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredPlaylists as playlist}
				<PlaylistCard
					{playlist}
					setSelectedPlaylistUri={() => selectedPlaylistUri = playlist.uri}
					compact={!!filterQuery}
				/>
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
							<Card.Content class="pt-6 flex justify-between items-start gap-2">
								<div>
									<h2 class="pb-2 text-xl font-semibold">
										{otherPlaylist.title}
										{otherPlaylist.emoji}
									</h2>
									<p class="text-muted-foreground">{otherPlaylist.description}</p>
								</div>

								{#if otherPlaylist.gif}
									<img
										src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
										data-gif-src={otherPlaylist.gif}
										data-gif-lazy
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
