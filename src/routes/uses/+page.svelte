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
	import { run } from 'svelte/legacy';

	import { Heading } from '$lib/components/typography';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { capitalize } from '$lib/helper';
	import { RotateCcw } from 'lucide-svelte';
	import SvgIcons from './icons';
	import uses from './uses.json';;

	let searchQuery = $state('');
	let selectedCategory: string | null = $state(null);
	let selectedTag: string | null = $state(null);

	// Get unique tags from all items
	let allTags = $derived([...new Set(uses.flatMap((item) => item.tags || []))].sort());
	let filteredUses = $derived(uses.filter((item) => {
        const lowerCaseQuery = searchQuery.toLowerCase();
		const matchesSearch =
        item.name.toLowerCase().includes(lowerCaseQuery) ||
        item.description?.toLowerCase().includes(lowerCaseQuery) ||
        item.tags?.some((tag) => tag.includes(lowerCaseQuery));
        
		const matchesCategory = !selectedCategory || item.category === selectedCategory;
        
		const matchesTags = !selectedTag || item.tags?.includes(selectedTag);
        
		return matchesSearch && matchesCategory && matchesTags;
	}));
    let filteredTags = $derived(allTags.filter(tag => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const matchesSearch = !lowerCaseQuery || filteredUses.some(item => item.tags?.includes(tag) && (item.tags?.some(tag => tag.includes(lowerCaseQuery)) || item.name.includes(lowerCaseQuery) || item.description?.includes(lowerCaseQuery)));
        const matchesCategory = !selectedCategory || filteredUses.some(item => item.tags?.includes(tag) && item.category === selectedCategory);
        return matchesSearch && matchesCategory;
    }));
    run(() => {
		if (selectedCategory) {
	        selectedTag = null;
	    }
	});

	function toggleTag(tag: string) {
		selectedTag = selectedTag !== tag ? tag : null;
	}

	function handleReset() {
		searchQuery = '';
		selectedCategory = '';
		selectedTag = null;
	}
</script>

<svelte:head>
	<title>Uses</title>
	<meta name="description" content="Tech I use" />
</svelte:head>

<div class="container">
	<Heading>Uses</Heading>

	<div class="mb-8 space-y-4">
		<div class="flex flex-col items-center gap-4 sm:flex-row">
			<Input placeholder="Search..." type="search" bind:value={searchQuery} />

			<Select.Root
                selected={{value: selectedCategory, label: capitalize(selectedCategory || 'All Categories')}}
				onSelectedChange={(selected) => (selectedCategory = String(selected?.value) || '')}
			>
				<Select.Trigger class="min-w-40">
					<Select.Value placeholder="Select category" />
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
						: 'bg-primary/10'}"
					onclick={() => toggleTag(tag)}
				>
					{capitalize(tag)}
				</button>
			{/each}

            {#if selectedCategory || selectedTag || searchQuery}
                <button
                    class="flex items-center rounded-full px-3 py-1 text-sm transition-colors bg-primary text-primary-foreground"
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

	<div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
		{#each filteredUses as item}
			<Card.Root>
				<Card.Content class="pt-6 h-full flex flex-col justify-between">
                    <div>
                        <img
							src={item.image.includes('http') ? item.image : SvgIcons[item.image]}
                            alt={item.name}
                            class="mb-4 h-48 w-full rounded-t-lg object-contain"
                        />
                        <h2 class="flex items-center mb-2 text-xl font-semibold">
                            {item.name}
                        </h2>
                        {#if item.description}
                            <p class="mb-4 text-muted-foreground">{item.description}</p>
                        {/if}
                    </div>
                    
                    <div>
                        <div class="mb-4 -ml-2 flex flex-wrap gap-2 justify-between">
                            {#if item.tags}
                                <div class="flex flex-wrap gap-2">
                                    {#each item.tags as tag}
                                        <span class="rounded-full bg-primary/10 px-2 py-1 text-sm">
                                            {capitalize(tag)}
                                        </span>
                                    {/each}
                                </div>
                            {/if}
                        </div>

                        {#if item.url}
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-sm hover:underline"
                            >
                                Learn More →
                            </a>
                        {/if}
                    </div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="my-4 text-center text-sm text-muted-foreground">
		{filteredUses.length} results found.
	</div>
</div>
