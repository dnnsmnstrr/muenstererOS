<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Heading } from '$lib/components/typography';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import projects from '../../data/projects.json' ;

	type Project = {
		title: string;
		description: string;
		tags: string[];
		webUrl?: string;
		appUrl?: string;
		githubUrl?: string;
		image: string;
	};
</script>

<svelte:head>
	<meta name="description" content={i18n.t('projects.description')} />
</svelte:head>

<div class="container">
	<Heading>{i18n.t('projects.title')}</Heading>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each projects as project}
			<Card.Root>
				<Card.Content class="pt-6">
					{#if project.image}
						<img
							src={project.image}
							alt={project.title}
							class="mb-4 h-48 w-full rounded-t-lg object-contain"
						/>
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
