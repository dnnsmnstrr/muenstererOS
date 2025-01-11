<script context="module" lang="ts">
	const categories = ['hardware', 'software', 'service', 'development'] as const;
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
	import * as Select from '$lib/components/ui/select';
	import { capitalize } from '$lib/helper';
	import { RotateCcw } from 'lucide-svelte';
	import Arc from './arc.svg';
	import Bitwarden from './bitwarden.svg';
	import Github from './github.svg';
	import JS from './js.svg';
	import Obsidian from './obsidian.svg';
	import Raycast from './raycast.svg';
	import React from './react.svg';
	import Spotify from './spotify.svg';
	import SvelteKit from './sveltekit.svg';
	import VSCode from './vscode.svg';

	const uses: UsesItem[] = [
		{
			name: 'Raycast',
			description: 'I cannot live without this application',
			url: 'https://raycast.com',
			category: 'software',
			tags: ['productivity'],
			image: Raycast
		},
		{
			name: 'Spotify',
			description: 'Music is Life!',
			url: 'https://www.spotify.com',
			category: 'service',
			tags: ['music'],
			image: Spotify
		},
		{
			name: 'Arc Browser',
			description: 'My current favorite browser',
			url: 'https://arc.net',
			category: 'software',
			tags: ['web'],
			image: Arc
		},
		{
			name: 'Obsidian',
			description: 'My digital brain',
			url: 'https://obsidian.md',
			category: 'software',
			tags: ['productivity'],
			image: Obsidian
		},
		{
			name: 'Bitwarden',
			description: 'Default password manager',
			url: 'https://bitwarden.com',
			category: 'software',
			tags: ['security'],
			image: Bitwarden
		},
		{
			name: 'Visual Studio Code',
			description: 'This is where I do my coding',
			url: 'https://code.visualstudio.com',
			category: 'software',
			tags: ['javascript'],
			image: VSCode
		},
		{
			name: 'Xcode',
			description: 'Need this to build apps',
			url: 'https://developer.apple.com/xcode/',
			category: 'software',
			tags: ['apple'],
			image: 'https://developer.apple.com/assets/elements/icons/xcode-12/xcode-12-96x96_2x.png'
		},
		{
			name: 'GitHub',
			description: 'Open source software FTW!!!',
			url: 'https://github.com',
			category: 'service',
			tags: ['git', 'web'],
			image: Github
		},
		{
			name: 'JavaScript',
			description: 'My favorite programming language (especially with TypeScript)',
			url: 'https://www.javascript.com',
			category: 'development',
			tags: ['javascript'],
			image: JS
		},
		{
			name: 'SvelteKit',
			description: 'This website is built with Svelte and SvelteKit!',
			url: 'https://kit.svelte.dev',
			category: 'development',
			tags: ['javascript'],
			image: SvelteKit
		},
		{
			name: 'React',
			description: 'A JavaScript library for building user interfaces',
			url: 'https://reactjs.org',
			category: 'development',
			tags: ['javascript'],
			image: React
		},
		// hardware
		{
			name: 'iPhone 13 Mini',
			description: 'The perfect size iPhone',
			url: 'https://support.apple.com/de-de/111873',
			category: 'hardware',
			tags: ['apple', 'smartphone'],
			image:
				'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111872_iphone13-mini-colors-480.png'
		},
		{
			name: 'Apple Watch Series 6',
			description: 'My daily companion for activity tracking and notifications',
			url: 'https://support.apple.com/de-de/111918',
			category: 'hardware',
			tags: ['apple'],
			image:
				'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111918_sp826-apple-watch-series6-580.png'
		},
		{
			name: 'AirTag',
			description: 'A small Bluetooth tracking device from Apple',
			url: 'https://www.apple.com/airtag/',
			category: 'hardware',
			tags: ['apple', 'smartphone'],
			image:
				'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airtag-single-select-202104?wid=532&hei=582&fmt=png-alpha&.v=1617761671000'
		},
		{
			name: 'M3 MacBook Air',
			description: 'A lightweight and powerful laptop for everyday tasks',
			url: 'https://www.apple.com/macbook-air/',
			category: 'hardware',
			tags: ['apple'],
			image:
				'https://www.apple.com/v/macbook-air/s/images/overview/routers/compare_mba_13_15__caznvrb61zyu_large_2x.png'
		},
		{
			name: 'Steam Deck',
			description: 'A handheld gaming PC developed by Valve Corporation',
			url: 'https://www.steamdeck.com/en/deck',
			category: 'hardware',
			tags: ['gaming'],
			image: 'https://cdn.cloudflare.steamstatic.com/steamdeck/images/deck/deck_top.png'
		},
		{
			name: 'Stream Deck',
			description: 'A customizable control panel for live streaming and content creation',
			url: 'https://www.elgato.com/en/gaming/stream-deck',
			category: 'hardware',
			tags: ['gaming'],
			image:
				'https://res.cloudinary.com/elgato-pwa/image/upload/q_auto,f_auto/v1710142076/legacy/organismCard/okjaup05hlxslkgzph9k.png'
		},
		{
			name: 'Logitech MX Series',
			description: 'I have the vertical mice, MX Keys Mini & MX Master 3s',
			url: 'https://www.logitech.com/en-us/mx/master-series.html',
			category: 'hardware',
			tags: ['laptop'],
			image:
				'https://resource.logitech.com/w_1600,c_limit,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/keyboards/mx-keys-mini/gallery/us/mx-keys-mini-top-black-us.png'
		},
		{
			name: 'Beats Studio Buds+',
			description: 'Wireless earbuds with active noise cancellation',
			url: 'https://www.beatsbydre.com/earbuds/studio-buds-plus-wireless-noise-cancelling/MQLK3/transparent',
			category: 'hardware',
			tags: ['music', 'apple'],
			image:
				'https://www.beatsbydre.com/content/dam/beats/web/product/earbuds/studio-buds-plus/pdp/studiobudsplus-pdp-p13.png.large.2x.png'
		},
		{
			name: 'Creality CR6-SE',
			description: 'A 3D printer I got through Kickstarter. Have two of them now.',
			url: 'https://www.creality.com/products/cr-6-se-3d-printer',
			category: 'hardware',
			tags: ['making'],
			image: 'https://img.staticdj.com/a79612e3276075fcc067c7a4cfe07d5e_1024x.jpg'
		},
		{
			name: 'Home Assistant Yellow',
			description: 'My smart home server running on a Raspberry Pi CM4',
			url: 'https://www.home-assistant.io/yellow/',
			category: 'hardware',
			tags: ['homelab'],
			image: 'https://www.home-assistant.io/images/yellow/yellow_hero.jpg'
		},
		{
			name: 'UGREEN NASync DXP4800Plus',
			description: 'My NAS for Backups and Data Storage',
			url: 'https://de.ugreen.com/pages/ugreen-nasync-series',
			category: 'hardware',
			tags: ['homelab'],
			image: 'https://de.ugreen.com/cdn/shop/files/ugreen-nasync-dxp4800-plus-715786-940519.png'
		},
	];

	let searchQuery = '';
	let selectedCategory: string | null = null;
	let selectedTag: string | null = null;

	// Get unique tags from all items
	$: allTags = [...new Set(uses.flatMap((item) => item.tags || []))].sort();

	$: filteredUses = uses.filter((item) => {
		const lowerCaseQuery = searchQuery.toLowerCase();
		const matchesSearch =
			item.name.toLowerCase().includes(lowerCaseQuery) ||
			item.description?.toLowerCase().includes(lowerCaseQuery) ||
			item.tags?.some((tag) => tag.includes(lowerCaseQuery));

		const matchesCategory = !selectedCategory || item.category === selectedCategory;

		const matchesTags = !selectedTag || item.tags?.includes(selectedTag);

		return matchesSearch && matchesCategory && matchesTags;
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
			{#each allTags as tag}
				<button
					class="rounded-full px-3 py-1 text-sm transition-colors {selectedTag === tag
						? 'bg-primary text-primary-foreground'
						: 'bg-primary/10'}"
					on:click={() => toggleTag(tag)}
				>
					{capitalize(tag)}
				</button>
			{/each}

            {#if selectedCategory || selectedTag || searchQuery}
                <button
                    class="flex items-center rounded-full px-3 py-1 text-sm transition-colors bg-primary text-primary-foreground"
                    on:click={handleReset}
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
                on:click={handleReset}
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
                            src={item.image}
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
