<script lang="ts">
	import { Heading } from '$lib/components/typography';
	import changes from './changes.json';
	type ChangeLogEntry = {
		date: string;
		title: string;
		description: string;
	};
	const changelog: ChangeLogEntry[] = changes;
</script>

<svelte:head>
	<title>Changelog</title>
</svelte:head>

<div class="container mx-auto p-4">
	<Heading>Changelog</Heading>
	<ul class="relative border-l border-foreground mt-8 ml-2">
		{#each changelog as entry, i}
			<li class="mb-10 ml-4 -translate-y-4 last:mb-0">
				<div class="absolute w-3 h-3 bg-primary rounded-full -translate-x-[22px] translate-y-2"></div>
				<h2 class="text-lg font-bold">{entry.title}</h2>
				<p class="text-sm text-gray-500">{entry.date}</p>
				<p>{entry.description}</p>
			</li>
		{/each}
	</ul>
</div>