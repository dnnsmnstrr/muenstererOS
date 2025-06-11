<script lang="ts">
	import { onDestroy } from 'svelte';
	import Heading from '$lib/components/typography/Heading.svelte';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import { getRedirectURL, type Redirect } from '$lib/utils/redirect';
	import Button from '$lib/components/ui/button/button.svelte';

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

	function getRandomRedirect() {
		if (!filteredRedirects.length) return null;
		return filteredRedirects[Math.floor(Math.random() * filteredRedirects.length)];
	}

	let shuffleEmoji: string = $state('🎲');
	let shuffleInterval: number | undefined;

	// Get emoji list from the redirects data
	function isEmoji(str?: string): boolean {
		if (!str) return false;
		const emojiRegex = /^(?:\p{Emoji}|\s)+$/u;
		return emojiRegex.test(str);
	}
	const emojiList: string[] = Array.from(
		new Set(
			data.redirects
				.flatMap((r) => r.aliases)
				.filter((alias): alias is string => !!alias && isEmoji(alias))
		)
	);

	function shuffleAndPick() {
		const emojis = emojiList;
		shuffleEmoji = '🎲';
		let count = 0;
		
		shuffleInterval = window.setInterval(() => {
			count++;
			const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
			if (randomEmoji && randomEmoji.length < 3) {
				shuffleEmoji = randomEmoji;
			} else {
				shuffleEmoji = '🎲'; // Fallback if emoji too long
			}
			// shuffleEmoji = emojis[Math.floor(Math.random() * emojis.length)];
			
			if (count > 10) {
				clearInterval(shuffleInterval);
				const redirect = getRandomRedirect();
				if (redirect && redirect.aliases?.some(isEmoji)) {
					// Pick the first emoji alias
					const firstEmoji = redirect.aliases.find(isEmoji);
					shuffleEmoji = firstEmoji || '🎲';
				}
				setTimeout(() => {
					if (redirect) {
						const url = getRedirectURL(redirect);
						if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
							window.open(url, '_self');
						} else {
							window.open(url, '_blank', 'noopener,noreferrer');
						}
					}
					shuffleEmoji = '🎲';
				}, 500);
			}
		}, 100);
	}

	onDestroy(() => {
		if (shuffleInterval) clearInterval(shuffleInterval);
	});
</script>

<div class="container">
	<div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
		<Heading class="mb-0">Redirects</Heading>
		<div class="flex w-full gap-2 sm:w-auto">
			<Button
				title="I'm feeling lucky"
				variant="outline"
				size="icon"
				class="shrink-0"
				onclick={shuffleAndPick}
			>
				{shuffleEmoji}
			</Button>
			<Input
				placeholder="Type to search..."
				type="search"
				class="w-full text-base sm:w-52"
				bind:value={filterQuery}
			/>
		</div>
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
