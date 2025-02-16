<script lang="ts">
	import { Heading } from '$lib/components/typography';

	type ChangeLogEntry = {
		date: string;
		title: string;
		description: string;
	};

	const changelog: ChangeLogEntry[] = [
		{
			date: '2025-02-15',
			title: 'Migrated to Svelte 5',
			description: 'The project was successfully migrated to Svelte 5 and the next version of shadcn-svelte.'
		},
        {
			date: '2024-12-24',
			title: 'Playlists',
			description: 'Created a page for my Spotify playlists over the Chrismas holidays.'
		},
        {
			date: '2024-06-16',
			title: 'muensterer.tech',
			description: 'Pointed my domain to this website.'
		},
        {
			date: '2024-02-05',
			title: 'Initial Version',
			description: 'Created a new personal website with SvelteKit.'
		}
		// Add more entries here
	];
</script>

<svelte:head>
	<title>Changelog</title>
</svelte:head>

<div class="container">
	<Heading>Changelog</Heading>
	<ul>
		{#each changelog as entry}
			<li class="mb-4">
				<h2 class="text-lg font-bold">{entry.title}</h2>
				<p class="text-sm text-gray-500">{entry.date}</p>
				<p>{entry.description}</p>
			</li>
		{/each}
	</ul>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem;
	}
</style>
