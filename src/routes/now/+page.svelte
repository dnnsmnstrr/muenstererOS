<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import Heading from '$lib/components/typography/Heading.svelte';
	import { MapPin, Music, Activity, Calendar, Code, InfoIcon } from 'lucide-svelte';
	import type { PageProps } from './$types';
	import { USERNAME_SHORT } from '$lib/config';
	import Link from '$lib/components/typography/Link.svelte';
	import playlists from '../playlists/playlists.json';
	import { MdSvelte } from '@jazzymcjazz/mdsvelte';
	import { renderers } from '$lib/components/typography';

	import {
		Root as Dialog,
		Trigger as DialogTrigger,
		Content as DialogContent,
		Close as DialogClose
	} from '$lib/components/ui/dialog';
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { Button } from '$lib/components/ui/button';
	import Versions from './Versions.svelte';
	
	let { data }: PageProps = $props();
	
	let nowData = $state(data.nowData);
	let showModal = $state(false);
	let currentPlaylist = playlists.find((p) => p.uri === nowData.playlist.uri);
	let playlistImage =
	currentPlaylist?.imageUrl ||
	(currentPlaylist?.imageId ? `https://i.scdn.co/image/${currentPlaylist.imageId}` : undefined);
	let projects = $state('')
	let plans = $state('')
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

	async function loadVersion(url: string) {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Failed to load version');
		}
		const apiData = await response.json();
		const gistData = JSON.parse(apiData.files['now.json'].content);
		console.log(apiData, gistData)
		nowData = {
			...gistData,
			updatedAt: new Date(apiData.updated_at).toISOString(),
			versions: nowData.versions
		};
		return gistData;

	}

</script>

<div class="container mx-auto p-4">
	<Heading class="mb-8 flex w-full items-center justify-between text-3xl">
		What I'm doing now
		<Link
			href="https://gist.github.com/{USERNAME_SHORT}/{nowData.gistId}"
			class="mt-2 block text-sm font-normal"
		>
			Last updated: {new Date(nowData.updatedAt).toLocaleDateString('en-US', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			})}
		</Link>
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

	<!-- Versions Button -->
	<div class="mt-8 text-center">
		<Versions
			versions={nowData.versions}
			versionPositions={versionPositions}
			loadVersion={loadVersion}
		/>
	</div>
</div>
