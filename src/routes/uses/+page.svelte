<script module lang="ts">
	const categories = ['hardware', 'software', 'development'] as const;
	export type UsesItem = {
		name: string;
		description?: string;
		url?: string;
		category: (typeof categories)[number];
		tags?: string[];
		image: string;
	};
</script>

<script lang="ts">
	import { Heading } from '$lib/components/typography';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	import { capitalize } from '$lib/utils/index';
	import {
		RotateCcw,
		HelpCircle,
		LayoutGrid,
		List,
		ArrowUpDown,
		ArrowUp,
		ArrowDown
	} from 'lucide-svelte';
	import SvgIcons from '$lib/components/icons';
	import uses from '../../data/uses.json';
	import Link from '$lib/components/typography/Link.svelte';
	import * as Table from '$lib/components/ui/table';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Badge } from '$lib/components/ui/badge';

	let searchQuery = $state('');
	let selectedCategory: string = $state('');
	let selectedTag: string | null = $state(null);
	let viewMode: 'grid' | 'table' = $state('grid');
	let sortConfig = $state({
		field: 'title' as 'title' | 'category',
		direction: 'asc' as 'asc' | 'desc'
	});

	// Get unique tags from all items
	let allTags = $derived([...new Set(uses.flatMap((item) => item.tags || []))].sort());
	let filteredUses = $derived(
		uses
			.filter((item) => {
				const lowerCaseQuery = searchQuery.toLowerCase();
				const matchesSearch =
					item.title.toLowerCase().includes(lowerCaseQuery) ||
					item.description?.toLowerCase().includes(lowerCaseQuery) ||
					item.tags?.some((tag) => tag.includes(lowerCaseQuery));

				const matchesCategory = !selectedCategory || item.category === selectedCategory;

				const matchesTags = !selectedTag || item.tags?.includes(selectedTag);

				return matchesSearch && matchesCategory && matchesTags;
			})
			.sort((a, b) => {
				const { field, direction } = sortConfig;
				const aValue = a[field].toLowerCase();
				const bValue = b[field].toLowerCase();
				if (aValue < bValue) return direction === 'asc' ? -1 : 1;
				if (aValue > bValue) return direction === 'asc' ? 1 : -1;
				return 0;
			})
	);
	let filteredTags = $derived(
		allTags.filter((tag) => {
			const lowerCaseQuery = searchQuery.toLowerCase();
			const matchesSearch =
				!lowerCaseQuery ||
				filteredUses.some(
					(item) =>
						item.tags?.includes(tag) &&
						(item.tags?.some((tag) => tag.includes(lowerCaseQuery)) ||
							item.title.includes(lowerCaseQuery) ||
							item.description?.includes(lowerCaseQuery))
				);
			const matchesCategory =
				!selectedCategory ||
				filteredUses.some((item) => item.tags?.includes(tag) && item.category === selectedCategory);
			return matchesSearch && matchesCategory;
		})
	);

	function toggleTag(tag: string) {
		selectedTag = selectedTag !== tag ? tag : null;
	}

	function handleReset() {
		searchQuery = '';
		selectedCategory = '';
		selectedTag = null;
		sortConfig = { field: 'title', direction: 'asc' };
	}

	function toggleSort(field: 'title' | 'category') {
		if (sortConfig.field === field) {
			sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
		} else {
			sortConfig.field = field;
			sortConfig.direction = 'asc';
		}
	}

	$effect(() => {
		// reset tag filter when category changes
		if (selectedCategory) {
			selectedTag = null;
		}
	});

	const triggerContent = $derived(
		capitalize(categories.find((category) => category === selectedCategory) ?? 'All Categories')
	);
</script>

<svelte:head>
	<meta name="description" content="Tech I use" />
</svelte:head>

<div class="container">
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<Heading class="mb-0">Uses</Heading>
			<Popover.Root>
				<Popover.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
					<HelpCircle />
				</Popover.Trigger>
				<Popover.Content>
					<div class="grid gap-4">
						<div class="space-y-2">
							<h4 class="font-medium leading-none">Things I use every day.</h4>
							<p class="text-sm text-muted-foreground">
								More Info in my <Link href="/zettelkasten/uses" target="_blank">Zettelkasten</Link>
							</p>
						</div>
					</div>
				</Popover.Content>
			</Popover.Root>
		</div>

		<div class="flex items-center gap-4">
			<p class="hidden text-sm text-muted-foreground sm:block">
				Inspired by <Link href="https://uses.tech" target="_blank">uses.tech</Link>
			</p>
			<Tabs.Root bind:value={viewMode}>
				<Tabs.List>
					<Tabs.Trigger value="grid">
						<LayoutGrid class="h-4 w-4" />
					</Tabs.Trigger>
					<Tabs.Trigger value="table">
						<List class="h-4 w-4" />
					</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
		</div>
	</div>

	<div class="mb-8 space-y-4">
		<div class="flex flex-col items-center gap-4 sm:flex-row">
			<Input placeholder="Search..." type="search" bind:value={searchQuery} />

			<Select.Root type="single" bind:value={selectedCategory}>
				<Select.Trigger class="min-w-40">
					{triggerContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value="">All Categories</Select.Item>
						{#each categories as category}
							<Select.Item value={category}>{capitalize(category)}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="flex flex-wrap gap-2">
			{#each filteredTags as tag}
				<button
					class="rounded-full px-3 py-1 text-sm transition-colors {selectedTag === tag
						? 'bg-primary text-primary-foreground'
						: 'bg-secondary'}"
					onclick={() => toggleTag(tag)}
				>
					{capitalize(tag)}
				</button>
			{/each}

			{#if selectedCategory || selectedTag || searchQuery}
				<button
					class="flex items-center rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground transition-colors"
					onclick={handleReset}
				>
					<RotateCcw class="h-4" />
					Reset Filters
				</button>
			{/if}
		</div>
	</div>

	{#if filteredUses.length === 0}
		<div class="text-center text-muted-foreground">
			No results found.
			<br />
			<button
				class="hover:bg-primary-500 mt-4 rounded-md bg-secondary px-4 py-2 transition duration-300 ease-in-out"
				onclick={handleReset}
			>
				Reset filters
			</button>
		</div>
	{/if}

	{#if viewMode === 'grid'}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each filteredUses as item}
				<Card.Root>
					<Card.Content class="flex h-full flex-col justify-between pt-6">
						<div>
							<img
								src={item.image && item.image.includes('/')
									? item.image
									: SvgIcons[item.image || item.title]}
								alt={item.title}
								class="mb-4 h-48 w-full rounded-t-lg object-contain"
							/>
							<h2 class="mb-2 flex items-center text-xl font-semibold">
								{#if item.url}
									<a
										class="hover:underline"
										href={item.url}
										target="_blank"
										rel="noopener noreferrer"
									>
										{item.title}
									</a>
								{:else}
									{item.title}
								{/if}
							</h2>
							{#if item.description}
								<p class="mb-4 text-muted-foreground">{item.description}</p>
							{/if}
						</div>

						<div>
							<div>
								<div class="-ml-2 mb-4 flex flex-wrap justify-between gap-2">
									{#if item.tags}
										<div class="flex flex-wrap gap-2">
											{#each item.tags as tag}
												<Badge variant="secondary" class="text-xs font-normal">
													{capitalize(tag)}
												</Badge>
											{/each}
										</div>
									{/if}
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else}
		<Card.Root>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[80px]">
							<span class="sr-only">Icon</span>
						</Table.Head>
						<Table.Head>
							<button
								class="flex items-center gap-1 hover:text-foreground"
								onclick={() => toggleSort('title')}
							>
								Title
								{#if sortConfig.field === 'title'}
									{#if sortConfig.direction === 'asc'}
										<ArrowUp class="h-3 w-3" />
									{:else}
										<ArrowDown class="h-3 w-3" />
									{/if}
								{:else}
									<ArrowUpDown class="h-3 w-3 opacity-50" />
								{/if}
							</button>
						</Table.Head>
						<Table.Head class="hidden md:table-cell">Description</Table.Head>
						<Table.Head>
							<button
								class="flex items-center gap-1 hover:text-foreground"
								onclick={() => toggleSort('category')}
							>
								Category
								{#if sortConfig.field === 'category'}
									{#if sortConfig.direction === 'asc'}
										<ArrowUp class="h-3 w-3" />
									{:else}
										<ArrowDown class="h-3 w-3" />
									{/if}
								{:else}
									<ArrowUpDown class="h-3 w-3 opacity-50" />
								{/if}
							</button>
						</Table.Head>
						<Table.Head>Tags</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filteredUses as item}
						<Table.Row>
							<Table.Cell>
								<img
									src={item.image && item.image.includes('/')
										? item.image
										: SvgIcons[item.image || item.title]}
									alt={item.title}
									class="h-10 w-10 object-contain"
								/>
							</Table.Cell>
							<Table.Cell class="font-medium">
								{#if item.url}
									<a
										class="hover:underline"
										href={item.url}
										target="_blank"
										rel="noopener noreferrer"
									>
										{item.title}
									</a>
								{:else}
									{item.title}
								{/if}
							</Table.Cell>
							<Table.Cell class="hidden md:table-cell">
								<p class="line-clamp-2 max-w-md text-sm text-muted-foreground">
									{item.description || '-'}
								</p>
							</Table.Cell>
							<Table.Cell>
								<Badge variant="outline">{capitalize(item.category)}</Badge>
							</Table.Cell>
							<Table.Cell>
								<div class="flex flex-wrap gap-1">
									{#if item.tags}
										{#each item.tags as tag}
											<Badge variant="secondary" class="text-xs font-normal"
												>{capitalize(tag)}</Badge
											>
										{/each}
									{/if}
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Root>
	{/if}

	{#if filteredUses.length > 0}
		<div class="my-4 text-center text-sm text-muted-foreground">
			{filteredUses.length} results found.
		</div>
	{/if}
</div>
