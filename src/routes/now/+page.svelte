<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import Heading from '$lib/components/typography/Heading.svelte';
	import { MapPin, Music, Calendar, Code, InfoIcon, Pencil, RotateCcw } from 'lucide-svelte';
	import type { PageProps } from './$types';
	import { NOW_GIST_ID, USERNAME_SHORT } from '$lib/config';
	import Link from '$lib/components/typography/Link.svelte';
	import playlists from '../../data/playlists.json';
	import { MdSvelte } from '@jazzymcjazz/mdsvelte';
	import { renderers } from '$lib/components/typography';
	import Versions from './Versions.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data }: PageProps = $props();

	let nowData = $state(data.nowData);
	let showingVersion = $state(false);
	let currentPlaylist = playlists.find((p) => p.uri === nowData.playlist.uri);
	let playlistImage =
		currentPlaylist?.imageUrl ||
		(currentPlaylist?.imageId ? `https://i.scdn.co/image/${currentPlaylist.imageId}` : undefined);
	let projects = $state('');
	let plans = $state('');
	let versionPositions = $state([]);
	$effect(() => {
		projects = '- ' + nowData.projects.join('\n- ');
		plans = '- ' + nowData.plans.join('\n- ');
		if (nowData.versions.length > 1) {
			const timestamps = nowData.versions.map((v) => new Date(v.timestamp).getTime());
			const minTime = Math.min(...timestamps);
			const maxTime = Math.max(...timestamps);
			const padding = 2;
			versionPositions = timestamps.map((t) => {
				const position = ((t - minTime) / (maxTime - minTime)) * 100;
				return Math.min(100 - padding, Math.max(padding, position));
			});
		}
	});

	async function loadVersion(url: string, timestamp?: string) {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Failed to load version');
		}
		const apiData = await response.json();
		const gistData = JSON.parse(apiData.files['now.json'].content);
		nowData = {
			...gistData,
			updatedAt: gistData.updatedAt || timestamp || new Date(apiData.updated_at).toISOString(),
			versions: nowData.versions,
			url: apiData.url
		};
		showingVersion = true;
		return gistData;
	}
</script>

<div class="container mx-auto p-4">
	<Heading class="mb-8 flex w-full items-center justify-between text-3xl">
		What I'm doing now
		<div class="flex items-center">
			<Link
				href={nowData.url || `https://gist.github.com/${USERNAME_SHORT}/${NOW_GIST_ID}`}
				class="block text-sm font-normal"
			>
				{#if showingVersion}
					Version from:
				{:else}
					Last updated:
				{/if}
				{new Date(nowData.updatedAt).toLocaleDateString('en-US', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit'
				})}
			</Link>
			{#if showingVersion}
				<Button
					class="ml-4"
					variant="outline"
					onclick={() => {
						nowData = data.nowData
						showingVersion = false;
					}}
				>
					<RotateCcw class="h-5 w-5" />
				</Button>
			{/if}
		</div>

	</Heading>

	<div class="grid grid-cols-12 grid-rows-5 gap-4 md:grid-rows-3">
		<Card class="col-span-12 col-start-1 row-span-1 row-start-1 p-4 sm:col-span-8">
			<Heading depth={2} class="mb-4 text-xl">
				<InfoIcon class="mb-1 mr-2 inline-block" /> Status
			</Heading>
			<MdSvelte source={nowData.status} {renderers} />
		</Card>

		<Card class="col-span-6 row-span-1 row-start-2 p-4 sm:col-span-4 lg:col-span-3 lg:col-start-6">
			<Heading depth={2} class="mb-4 text-xl">
				<MapPin class="mr-2 inline-block" />
				<Link href="/where">Location</Link>
			</Heading>
			<p>{nowData.location}</p>
		</Card>

		<Card class="col-span-6 row-span-1 p-4 sm:col-span-4 lg:row-span-2 lg:row-start-1">
			<Heading depth={2} class="mb-2 text-xl">
				<Music class="mr-2 inline-block" />
				<Link href="/playlists">Playlist</Link>
			</Heading>
			{#if nowData.playlist}
				<div class="flex flex-col items-center space-y-2">
					{#if playlistImage}
						<img
							src={playlistImage}
							alt="Playlist cover"
							class="aspect-square w-full rounded-md object-cover"
						/>
					{/if}
					<Link href={`https://open.spotify.com/playlist/${nowData.playlist.uri}`} target="_blank">
						{nowData.playlist.name}
					</Link>
				</div>
			{:else}
				<p class="text-muted-foreground">No playlist available</p>
			{/if}
		</Card>

		<Card class="col-span-12 row-span-1 p-4 sm:col-span-8 sm:row-span-1 lg:col-start-6">
			<Heading depth={2} class="mb-4 flex items-center text-xl">
				<Calendar class="mr-2 inline-block" /> Plans
			</Heading>
			<MdSvelte source={plans} {renderers} />
		</Card>

		<Card
			class="col-span-12 col-start-1 row-span-2 row-start-4 p-4 sm:row-start-3 lg:col-span-5 lg:row-start-2"
		>
			<Heading depth={2} class="mb-4 flex items-center text-xl">
				<Code class="mr-2 inline-block" />
				<Link href="/projects">Projects</Link>
			</Heading>
			<MdSvelte source={projects} {renderers} />
		</Card>
	</div>

	<div class="mt-4 flex items-center justify-center gap-2">
		<Versions versions={nowData.versions} {versionPositions} {loadVersion} />
		<Button class="" variant="ghost" aria-label="Edit">
			<Pencil class="h-5 w-5" />
			<span>Edit latest </span>
		</Button>
	</div>
</div>
