<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import Heading from '$lib/components/typography/Heading.svelte';
	import { MapPin, Music, Activity, Calendar, Code } from 'lucide-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { nowData } = data;
</script>

<div class="container mx-auto p-4">
	<Heading class="text-3xl mb-4">
		What I'm doing now
	</Heading>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		<Card class="p-4">
			<Heading depth={2} class="text-xl mb-2">
				<MapPin class="inline-block mr-2" /> Location
			</Heading>
			<p>{nowData.location}</p> 
		</Card>

		<Card class="p-4">
			<Heading depth={2} class="text-xl mb-2">
				<Music class="inline-block mr-2" /> Playlist
			</Heading>
			<p>
				<a href={`https://open.spotify.com/playlist/${nowData.playlist.uri}`} target="_blank" class="text-blue-500 hover:underline">{nowData.playlist.name}</a>
			</p>
		</Card>

		{#if nowData?.activities?.length}
			<Card class="p-4">
				<Heading depth={2} class="text-xl mb-2">
					<Activity class="inline-block mr-2" /> Activities
				</Heading>
				<ul class="list-disc list-inside">
					{#each nowData.activities as activity}
						<li>{activity}</li>
					{/each}
				</ul>
			</Card>
		{/if}

		<Card class="p-4">
			<Heading depth={2} class="text-xl mb-2">
				<Calendar class="inline-block mr-2" /> Plans
			</Heading>
			<ul class="list-disc list-inside">
				{#each nowData.plans as plan}
					<li>{plan}</li>
				{/each}
			</ul>
		</Card>

		<Card class="p-4">
			<Heading depth={2} class="text-xl mb-2">
				<Code class="inline-block mr-2" /> Projects
			</Heading>
            <ul class="list-disc list-inside">
                {#each nowData.projects as project}
                    <li>{@html project}</li>
                {/each}
            </ul>
		</Card>
	</div>
</div>