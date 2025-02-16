<script lang="ts">
	import { run } from 'svelte/legacy';

	import Heading from '$lib/components/typography/Heading.svelte';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import { getRedirectURL, type Redirect } from '$lib/utils/redirect';

	let { data } = $props();
	function handleRedirect(redirect: Redirect) {
		const redirectUrl = getRedirectURL(redirect);
		window.open(redirectUrl, '_blank');
	}
	let filterQuery = $state('');
	const searchFilter = (redirect: Redirect) => {
		if (!filterQuery) {
			return true;
		}

		return (
			redirect.name.includes(filterQuery.toLowerCase()) ||
			redirect.aliases?.some((alias) => alias.includes(filterQuery.toLowerCase()))
		);
	};
	let filteredRedirects = $state(data.redirects);
	$effect(() => {
		if (filterQuery || data.redirects) {
			filteredRedirects = data.redirects.filter(searchFilter);
			filterQuery;
		}
	});
</script>

<div class="container">
	<div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
		<Heading class="mb-0">Redirects</Heading>
		<Input
			placeholder="Type to search..."
			type="search"
			class="w-full text-base sm:w-52"
			bind:value={filterQuery}
		/>
	</div>

	<Card.Root class="hidden max-h-[75vh] overflow-scroll sm:block">
		<Table.Root class="mb-4">
			<Table.Caption
				>{filterQuery ? `Matching redirects: ${filteredRedirects.length}, ` : ''}Total: {data
					.redirects.length}</Table.Caption
			>
			<Table.Header class="sticky top-0 bg-card">
				<Table.Row>
					<Table.Head class="w-[100px]">Name</Table.Head>
					<Table.Head>Description</Table.Head>
					<Table.Head>Aliases</Table.Head>
					<Table.Head class="text-right">URL</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filteredRedirects as redirect}
					<Table.Row onclick={() => handleRedirect(redirect)} class="cursor-pointer">
						<Table.Cell class="font-medium">{redirect.name}</Table.Cell>
						<Table.Cell>{redirect.description || '-'}</Table.Cell>
						<Table.Cell>{redirect.aliases?.join(', ') || '-'}</Table.Cell>
						<Table.Cell class="text-right"
							>{redirect.url || '/' + redirect.name.toLocaleLowerCase()}</Table.Cell
						>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Root>

	<div class="block sm:hidden">
		{#each filteredRedirects as redirect}
			<Card.Root class="mb-4 cursor-pointer" onclick={() => handleRedirect(redirect)}>
				<div class="p-4">
					<h2 class="text-lg font-bold flex flex-wrap items-center gap-2">
						{redirect.name}
						{#if redirect.aliases && redirect.aliases.length}
							{#each redirect.aliases as alias}
								<code class="text-xs text-gray-500">{alias}</code>
							{/each}
						{/if}
					</h2>
					{#if redirect.description}
						<p>{redirect.description}</p>
					{/if}

          <p class="pt-3 pb-1 overflow-hidden overflow-x-auto font-mono text-sm text-gray-500">
            {redirect.url || '/' + redirect.name.toLocaleLowerCase()}
          </p>
				</div>
			</Card.Root>
		{/each}
	</div>
</div>
