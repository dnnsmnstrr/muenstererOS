<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import Heading from '$lib/components/typography/Heading.svelte';
	import { MapPin, Music, Activity, Calendar, Code, InfoIcon } from 'lucide-svelte';
	import type { PageProps } from './$types';
	import { USERNAME_SHORT } from '$lib/config';
	import Link from '$lib/components/typography/Link.svelte';
	import playlists from '../playlists/playlists.json';

	let { data }: PageProps = $props();
	let { nowData } = data;

	let currentPlaylist = playlists.find(p => p.uri === nowData.playlist.uri);
	let playlistImage = currentPlaylist?.imageUrl || (currentPlaylist?.imageId ? `https://i.scdn.co/image/${currentPlaylist.imageId}` : undefined);
</script>

<div class="container mx-auto p-4">
	<Heading class="flex w-full justify-between text-3xl mb-4">
		What I'm doing now
        <Link 
            href="https://gist.github.com/{USERNAME_SHORT}/{nowData.gistId}" 
            class="text-sm font-normal block mt-2"
        >
            Data Source
        </Link>
	</Heading>

	<div class="grid grid-cols-7 md:grid-cols-10 lg:grid-cols-12 gap-4 grid-rows-4">
		<Card class="p-4 col-start-1 row-start-1 col-span-8 row-span-1">
			<Heading depth={2} class="text-xl mb-4">
				<InfoIcon class="inline-block mr-2" /> Status
			</Heading>
			<p>{nowData.status}</p> 
		</Card>

		<Card class="p-4 col-span-3 row-start-2 row-span-1">
			<Heading depth={2} class="text-xl mb-4">
				<MapPin class="inline-block mr-2" /> Location
			</Heading>
			<p>{nowData.location}</p> 
		</Card>

		<Card class="p-4 col-span-4 row-span-2">
			<Heading depth={2} class="text-xl mb-2">
				<Music class="inline-block mr-2 mb-1" /> Playlist
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

		<!-- Activities section - offset to the right -->
		{#if nowData?.activities?.length}
			<Card class="p-4 col-span-3 col-start-2">
				<Heading depth={2} class="text-xl mb-4 flex items-center">
					<Activity class="inline-block mr-2" /> Activities
				</Heading>
				<ul class="space-y-2 list-inside">
					{#each nowData.activities as activity}
						<li class="pl-4">{activity}</li>
					{/each}
				</ul>
			</Card>
		{/if}

		<!-- Plans section - full width -->
		<Card class="p-4 col-span-7 row-span-1">
			<Heading depth={2} class="text-xl mb-4 flex items-center">
				<Calendar class="inline-block mr-2" /> Plans
			</Heading>
			<ul class="space-y-2 list-inside">
				{#each nowData.plans as plan}
					<li class="pl-4">{plan}</li>
				{/each}
			</ul>
		</Card>

		<!-- Projects section - offset to the left -->
		<Card class="p-4 col-start-1 row-start-2 col-span-5 row-span-2">
			<Heading depth={2} class="text-xl mb-4 flex items-center">
				<Code class="inline-block mr-2" /> Projects
			</Heading>
			<ul class="space-y-2 list-inside">
				{#each nowData.projects as project}
					<li class="pl-4">{@html project}</li>
				{/each}
			</ul>
		</Card>
	</div>
</div>