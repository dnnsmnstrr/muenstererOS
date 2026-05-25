<script lang="ts">
	import { onMount } from 'svelte';
	import { Heading, Link, Kbd } from '$lib/components/typography';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { Search, Copy, Check, Download } from 'lucide-svelte';
	import Raycast from '$lib/components/icons/raycast.svg';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX, USERNAME_SHORT } from '$lib/config';
	import { toast } from 'svelte-sonner';
	import snippetsData from '../../data/snippets.json';

	interface Snippet {
		name: string;
		text: string;
		keyword?: string;
		category?: string;
	}

	let searchQuery = $state('');
	let selectedCategory = $state('All');
	let selectedSnippetNames = $state<string[]>([]);
	let copiedId = $state<string | null>(null);

	const categories = ['All', ...new Set(snippetsData.map((s) => s.category).filter(Boolean))];

	const filteredSnippets = $derived(
		snippetsData.filter((s) => {
			const matchesSearch =
				s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.keyword?.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
			return matchesSearch && matchesCategory;
		})
	);

	const selectedSnippets = $derived(
		snippetsData.filter((s) => selectedSnippetNames.includes(s.name))
	);

	function toggleSelection(snippet: Snippet) {
		if (selectedSnippetNames.includes(snippet.name)) {
			selectedSnippetNames = selectedSnippetNames.filter((name) => name !== snippet.name);
		} else {
			selectedSnippetNames = [...selectedSnippetNames, snippet.name];
		}
	}

	function copyToClipboard(text: string, id: string) {
		navigator.clipboard.writeText(text);
		copiedId = id;
		toast.success(i18n.t('snippets.copied'));
		setTimeout(() => {
			if (copiedId === id) copiedId = null;
		}, 2000);
	}

	function importToRaycast() {
		const itemsToImport = selectedSnippets.length > 0 ? selectedSnippets : filteredSnippets;
		const raycastData = itemsToImport.map((s) => ({
			name: s.name,
			text: s.text,
			keyword: s.keyword
		}));

		// Raycast JSON import deep link
		// Note: The actual deep link for importing snippets is raycast://extensions/raycast/snippets/import-snippets
		// with the JSON data passed in the 'arguments' parameter as a URL-encoded JSON string.
		// The 'snippets' argument expects a stringified JSON array.
		const url = `raycast://extensions/raycast/snippets/import-snippets?arguments=${encodeURIComponent(
			JSON.stringify({ snippets: JSON.stringify(raycastData) })
		)}`;
		window.location.href = url;
	}

	function formatSnippetText(text: string) {
		// Escape HTML special characters
		const escaped = text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');

		// Highlight placeholders like {date}, {time}, {cursor}, etc.
		return escaped.replace(/\{[^{}]+\}/g, (match) => `<span class="text-primary font-bold">${match}</span>`);
	}

	const title = $derived(i18n.t('snippets.title'));
</script>

<svelte:head>
	<title>{title}{PAGE_TITLE_SUFFIX}</title>
	<meta name="description" content={i18n.t('snippets.meta_description')} />
</svelte:head>

<div class="container pb-20">
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<Heading class="mb-0">{i18n.t('snippets.heading')}</Heading>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				href={`https://raycast.com/?via=${USERNAME_SHORT}`}
				target="_blank"
				rel="noopener noreferrer"
				class="hidden sm:flex items-center gap-2"
			>
				<img src={Raycast} alt="Raycast" class="h-4 w-4" />
				<span>{i18n.t('hotkeys.try_raycast')}</span>
			</Button>
			<Button
				variant="default"
				onclick={importToRaycast}
				class="flex items-center gap-2"
				disabled={filteredSnippets.length === 0}
			>
				<Download class="h-4 w-4" />
				<span>
					{selectedSnippetNames.length > 0
						? i18n.t('snippets.import_selected', { count: selectedSnippetNames.length.toString() })
						: i18n.t('snippets.import_all')}
				</span>
			</Button>
		</div>
	</div>

	<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
		<div class="relative flex-1">
			<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="text"
				placeholder={i18n.t('snippets.search_placeholder')}
				class="pl-10"
				bind:value={searchQuery}
			/>
		</div>
		<div class="w-full sm:w-48">
			<Select.Root
				type="single"
				value={selectedCategory}
				onValueChange={(v) => (selectedCategory = v || 'All')}
			>
				<Select.Trigger>
					{selectedCategory}
				</Select.Trigger>
				<Select.Content>
					{#each categories as category}
						<Select.Item value={category} label={category} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each filteredSnippets as snippet}
			<div
				role="button"
				tabindex="0"
				class="group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:ring-2 hover:ring-primary/50 {selectedSnippetNames.includes(
					snippet.name
				)
					? 'ring-2 ring-primary'
					: ''}"
				onclick={() => toggleSelection(snippet)}
				onkeydown={(e) => e.key === 'Enter' && toggleSelection(snippet)}
			>
				<Card.Header class="pb-2">
					<div class="flex items-start justify-between">
						<Card.Title class="text-lg">{snippet.name}</Card.Title>
						{#if snippet.keyword}
							<Kbd class="text-xs">{snippet.keyword}</Kbd>
						{/if}
					</div>
					{#if snippet.category}
						<Card.Description class="text-xs uppercase tracking-wider"
							>{snippet.category}</Card.Description
						>
					{/if}
				</Card.Header>
				<Card.Content class="flex-1 pb-12 font-mono text-sm">
					<div class="rounded-md bg-muted/50 p-3">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						<pre class="whitespace-pre-wrap">{@html formatSnippetText(snippet.text)}</pre>
					</div>
				</Card.Content>
				<div
					class="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100"
				>
					<Button
						variant="secondary"
						size="icon"
						class="h-8 w-8"
						onclick={(e) => {
							e.stopPropagation();
							copyToClipboard(snippet.text, snippet.name);
						}}
					>
						{#if copiedId === snippet.name}
							<Check class="h-4 w-4 text-green-500" />
						{:else}
							<Copy class="h-4 w-4" />
						{/if}
					</Button>
				</div>
			</div>
		{/each}
	</div>

	{#if filteredSnippets.length === 0}
		<div class="py-20 text-center">
			<p class="text-muted-foreground">{i18n.t('snippets.no_results')}</p>
		</div>
	{/if}
</div>
