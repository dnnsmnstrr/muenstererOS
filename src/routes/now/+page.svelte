<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import Heading from '$lib/components/typography/Heading.svelte';
	import { MapPin, Music, Activity, Calendar, Code, InfoIcon } from 'lucide-svelte';
	import type { PageProps } from './$types';
	import { USERNAME_SHORT } from '$lib/config';
	import Link from '$lib/components/typography/Link.svelte';
	import playlists from '../playlists/playlists.json';
	import { MdSvelte } from '@jazzymcjazz/mdsvelte';
	import { renderers } from "$lib/components/typography";

	let { data }: PageProps = $props();
	let { nowData } = data;

	console.log(nowData)
	let currentPlaylist = playlists.find(p => p.uri === nowData.playlist.uri);
	let playlistImage = currentPlaylist?.imageUrl || (currentPlaylist?.imageId ? `https://i.scdn.co/image/${currentPlaylist.imageId}` : undefined);
	let projects = '- ' + nowData.projects.join('\n- ')
	let plans = '- ' + nowData.plans.join('\n- ')
</script>

<div class="container mx-auto p-4">
	<Heading class="flex w-full justify-between items-center text-3xl mb-8">
		What I'm doing now
        <Link 
            href={nowData.gistUrl}
            class="text-sm font-normal block mt-2"
        >
            Last updated: {new Date(nowData.updatedAt).toLocaleDateString('en-US', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			})}
        </Link>
	</Heading>

	<div class="grid grid-cols-12 gap-4 grid-rows-5 md:grid-rows-3">
		<Card class="p-4 col-start-1 row-start-1 col-span-12 sm:col-span-8 row-span-1">
			<Heading depth={2} class="text-xl mb-4">
				<InfoIcon class="inline-block mr-2 mb-1" /> Status
			</Heading>
			<MdSvelte source={nowData.status} {renderers} />
		</Card>

		<Card class="p-4 col-span-6 sm:col-span-4 lg:col-span-3 lg:col-start-6 row-start-2 row-span-1">
			<Heading depth={2} class="text-xl mb-4">
				<MapPin class="inline-block mr-2" /> 
				<Link href="/where">Location</Link>
			</Heading>
			<p>{nowData.location}</p> 
		</Card>

		<Card class="p-4 col-span-6 sm:col-span-4 row-span-1 lg:row-span-2 lg:row-start-1">
			<Heading depth={2} class="text-xl mb-2">
				<Music class="inline-block mr-2" /> 
				<Link href="/playlists">Playlist</Link>
			</Heading>
			<div class="space-y-2 flex flex-col items-center">
				{#if playlistImage}
					<img
						src={playlistImage}
						alt="Playlist cover"
						class="w-full aspect-square object-cover rounded-md"
					/>
				{/if}
				<Link
					href={`https://open.spotify.com/playlist/${nowData.playlist.uri}`} 
					target="_blank" 
				>
					{nowData.playlist.name}
				</Link>
			</div>
		</Card>

		<Card class="p-4 col-span-12 sm:col-span-8 lg:col-start-6 row-span-1 sm:row-span-1">
			<Heading depth={2} class="text-xl mb-4 flex items-center">
				<Calendar class="inline-block mr-2" /> Plans
			</Heading>
			<MdSvelte source={plans} {renderers} />
		</Card>

		<Card 
			class="p-4 col-start-1 row-start-4 sm:row-start-3 lg:row-start-2 col-span-12 lg:col-span-5 row-span-2"
		>
			<Heading depth={2} class="text-xl mb-4 flex items-center">
				<Code class="inline-block mr-2" /> 
				<Link href="/projects">Projects</Link>
			</Heading>
			<MdSvelte source={projects} {renderers} />
		</Card>
	</div>
</div>