<script lang="ts">
	import { Heading } from '$lib/components/typography';
	import Link from '$lib/components/typography/Link.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import buttons from '../../data/buttons.json';

	const categories = ['tech', 'personal', 'fun', 'political'] as const;

	let selectedCategory = $state('');

	let filteredButtons = $derived(
		selectedCategory
			? buttons.filter((button) => button.category === selectedCategory)
			: buttons
	);

	const triggerContent = $derived(
		selectedCategory
			? i18n.t('buttons.categories.' + selectedCategory)
			: i18n.t('buttons.all_categories')
	);
</script>

<svelte:head>
	<title>{i18n.t('buttons.title') + PAGE_TITLE_SUFFIX}</title>
	<meta name="description" content={i18n.t('buttons.description')} />
</svelte:head>

<div class="container pb-8 md:p-12">
	<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
		<div>
			<Heading class="mb-2">{i18n.t('buttons.title')}</Heading>
			<p class="text-muted-foreground">
				{i18n.t('buttons.description')}
				<Link href="https://eightyeightthirty.one/" target="_blank">
					{i18n.t('buttons.external_link_text')}
				</Link>
			</p>
		</div>

		<Select.Root type="single" bind:value={selectedCategory}>
			<Select.Trigger class="w-[200px]">
				{triggerContent}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Item value="">{i18n.t('buttons.all_categories')}</Select.Item>
					{#each categories as category}
						<Select.Item value={category}>{i18n.t('buttons.categories.' + category)}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>

	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
		{#each filteredButtons as button}
			<Card.Root class="flex aspect-[88/31] items-center justify-center overflow-hidden transition-transform hover:scale-105">
				<a href={button.href} target="_blank" rel="noopener noreferrer" class="h-full w-full">
					<img
						src={button.src}
						alt={button.alt}
						title={button.alt}
						class="h-full w-full object-fill"
					/>
				</a>
			</Card.Root>
		{/each}
	</div>
</div>
