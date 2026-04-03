<script lang="ts">
	import { Heading } from '$lib/components/typography';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { formatDate } from '$lib/utils/helper';
	import changes from '../../data/changes.json?raw';

	type ChangeLogEntry = {
		date: string;
		title: string;
		description: string;
		path?: string;
	};

	/**
	 * Parse changelog data from JSON.
	 */
	const changelog = JSON.parse(changes) as ChangeLogEntry[];
</script>

<svelte:head>
	<title>{i18n.t('common.changelog')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<div class="container mx-auto p-4">
	<Heading>{i18n.t('common.changelog')}</Heading>
	<ul class="relative border-l border-foreground mt-8 ml-2">
		{#each changelog as entry, i}
			<li class="mb-10 ml-4 -translate-y-4 last:mb-0">
				<div
					class="absolute h-3 w-3 rounded-full bg-primary -translate-x-[22px] translate-y-2"
				></div>
				<h2 class="text-lg font-bold"><a href={entry.path}>{entry.title}</a></h2>
				<!-- Localize the date formatting based on the current language -->
				<p class="text-sm text-gray-500">{formatDate(entry.date)}</p>
				<p>{entry.description}</p>
			</li>
		{/each}
	</ul>
</div>
