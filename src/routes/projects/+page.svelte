<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { setContext } from 'svelte';
	import { page } from '$app/stores';

	type Project = {
		title: string;
		description: string;
		technologies: string[];
		webUrl?: string;
		githubUrl?: string;
		liveUrl?: string;
		image: string;
	};

	const projects: Project[] = [
		{
			title: 'muenstererOS',
			description: 'This website',
			technologies: ['SvelteKit', 'shadcn-svelte'],
			githubUrl: 'https://github.com/dnnsmnstrr/muenstererOS',
			webUrl: 'https://muensterer.tech',
			image: '/muenstererOS.png'
		},
		{
			title: 'Progressions',
			description: 'An app to manage lyrics and chords',
			technologies: ['React Native', 'Expo', 'tamagui'],
			githubUrl: 'https://github.com/dnnsmnstrr/progressions-new',
			webUrl: 'https://progressions.live',
			image: 'https://progressions.live/assets/images/songs-46ee7bf1e248d2e1fcfce53dc71d07e1.png'
		},
		{
			title: 'Zettelkasten',
			description: 'My digital note-taking system',
			technologies: ['Dendron'],
			webUrl: 'https://dnnsmnstrr.gitlab.io/zettelkasten/',
			githubUrl: 'https://github.com/dnnsmnstrr/zettelkasten',
			image:
				'https://assets.website-files.com/60f575ce343a495071f83206/6139d40abef777e56891db91_dendron-logo-original-green.svg'
		},
    {
      title: 'BetterTouchTool Extension',
      description: 'A custom extension to search and execute named triggers in BTT directly from Raycast',
      technologies: ['Raycast', '1k+ Installs', 'TypeScript'],
      webUrl: 'https://www.raycast.com/dnnsmnstrr/bettertouchtool',
      githubUrl: 'https://github.com/raycast/extensions/tree/9ef485ab6cafe15b5968681d752f597b2ed6873a/extensions/bettertouchtool/',
      image: 'https://files.raycast.com/9scaxngh5f31po57vd2mrxsnubaz'
    },
    {
      title: 'Markdown Slides Extension',
      description: 'A custom extension to search and execute named triggers in BTT directly from Raycast',
      technologies: ['Raycast', 'Markdown'],
      webUrl: 'https://www.raycast.com/dnnsmnstrr/markdown-slides',
      githubUrl: 'https://github.com/raycast/extensions/tree/1f943e7af910a4cbe97a02a95b86e22f0022b490/extensions/markdown-slides/',
      image: 'https://files.raycast.com/cnpj978kwys39v4lll900b7d1wi6'
    },
	];
</script>

<svelte:head>
	<title>Projects</title>
</svelte:head>

<div class="container overflow-y-scroll p-4">
	<h1 class="mb-6 text-3xl font-bold">My Projects</h1>

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
						{#each project.technologies as tech}
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
								Website →
							</a>
						{/if}
						{#if project.liveUrl}
							<a
								href={project.liveUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm hover:underline"
							>
								Live Demo →
							</a>
						{/if}
						{#if project.githubUrl}
							<a
								href={project.githubUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm hover:underline"
							>
								GitHub →
							</a>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>
