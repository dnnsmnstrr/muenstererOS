<script lang="ts">
	import * as Card from '$lib/components/ui/card';
  import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { Heading } from '$lib/components/typography';
	import { i18n } from '$lib/i18n/i18n.svelte';

	/**
	 * Localization: Localize the "All Tags" string for consistency across all filterable pages.
	 */

	import { capitalize } from '$lib/utils/index';
	import projects from '../../data/projects.json';

	type Project = {
		title: string;
		description: string;
		tags: string[];
		badge?: string;
		webUrl?: string;
		appUrl?: string;
		githubUrl?: string;
		image: string;
	};

	let selectedTag = $state('');
	const allTags = $derived([...new Set(projects.flatMap((p) => p.tags))].sort());
	const filteredProjects = $derived(
		selectedTag === '' ? projects : projects.filter((p) => p.tags.includes(selectedTag))
	);

	const triggerContent = $derived(
		selectedTag === '' ? i18n.t('projects.all_tags') : capitalize(selectedTag)
	);
</script>

<svelte:head>
	<meta name="description" content={i18n.t('projects.description')} />
</svelte:head>

<div class="container">
	<div class="mb-6 flex items-center justify-between">
		<Heading class="mb-0">{i18n.t('projects.title')}</Heading>

		<Select.Root type="single" bind:value={selectedTag}>
			<Select.Trigger class="w-[180px]">
				{triggerContent}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="">{i18n.t('projects.all_tags')}</Select.Item>
				{#each allTags as tag}
					<Select.Item value={tag}>{capitalize(tag)}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each filteredProjects as project}
			<Card.Root>
				<Card.Content class="pt-6">
					{#if project.image}
						<div class="relative mb-4">
							<img
								src={project.image}
								alt={project.title}
								class="h-48 w-full rounded-t-lg object-contain"
							/>
							{#if project.badge}
								<Badge class="absolute bottom-2 right-2">
									{project.badge}
								</Badge>
							{/if}
						</div>
					{/if}
					<h2 class="mb-2 text-xl font-semibold">{project.title}</h2>
					<p class="mb-4 text-muted-foreground">{project.description}</p>

					<div class="mb-4 flex flex-wrap gap-2">
						{#each project.tags as tech}
							<span class="rounded-full bg-primary/10 px-2 py-1 text-sm">
								{tech}
							</span>
						{/each}
					</div>

					<div class="flex gap-4">
						{#if project.webUrl}
							<a
								href={project.webUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm hover:underline"
							>
								{i18n.t('projects.website')} →
							</a>
						{/if}
						{#if project.appUrl}
							<a
								href={project.appUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm hover:underline"
							>
								{i18n.t('projects.app')} →
							</a>
						{/if}
						{#if project.githubUrl}
							<a
								href={project.githubUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm hover:underline"
							>
								{i18n.t('projects.github')} →
							</a>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>
