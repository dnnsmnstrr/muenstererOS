<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Heading } from '$lib/components/typography';

	type Project = {
		title: string;
		description: string;
		technologies: string[];
		webUrl?: string;
		appUrl?: string;
		githubUrl?: string;
		image: string;
	};

	const projects: Project[] = [
		{
			title: 'muenstererOS',
			description: 'This website',
			technologies: ['SvelteKit', 'shadcn-svelte'],
			githubUrl: 'https://github.com/dnnsmnstrr/muenstererOS',
			webUrl: 'https://muensterer.tech',
			image: '/images/muenstererOS.png'
		},
		{
			title: 'Zettelkasten',
			description: 'My digital note-taking system',
			technologies: ['Dendron'],
			webUrl: 'https://dnnsmnstrr.gitlab.io/zettelkasten/',
			githubUrl: 'https://github.com/dnnsmnstrr/zettelkasten',
			image:
				'/images/zettelkasten.png'
		},
		{
			title: 'Progressions',
			description: 'An app to manage lyrics and chords',
			technologies: ['React Native', 'Expo', 'tamagui'],
			githubUrl: 'https://github.com/dnnsmnstrr/progressions-new',
			appUrl: 'https://progressions.expo.app/',
			webUrl: 'https://progressions-web.vercel.app/',
			image: '/images/Progressions.png'
		},
		{
			title: 'BetterTouchTool Extension',
			description:
				'A custom extension to search and execute named triggers in BTT directly from Raycast',
			technologies: ['Raycast', '2k+ Installs', 'TypeScript'],
			webUrl: 'https://www.raycast.com/dnnsmnstrr/bettertouchtool',
			githubUrl:
				'https://github.com/raycast/extensions/tree/main/extensions/bettertouchtool/',
			image: 'https://files.raycast.com/9scaxngh5f31po57vd2mrxsnubaz'
		},
		{
			title: 'Markdown Slides Extension',
			description:
				'A solution for creating and presenting slides written in Markdown directly from Raycast',
			technologies: ['Raycast', 'Markdown'],
			webUrl: 'https://www.raycast.com/dnnsmnstrr/markdown-slides',
			githubUrl:
				'https://github.com/raycast/extensions/tree/main/extensions/markdown-slides/',
			image: 'https://files.raycast.com/cnpj978kwys39v4lll900b7d1wi6'
		},
		// {
		// 	title: '40 Questions Extension',
		// 	description:
		// 		'An intuitive interface to answer and browse 40 questions for reflecting each year',
		// 	technologies: ['Raycast', 'Mindfulness'],
		// 	webUrl: 'https://www.raycast.com/dnnsmnstrr/40-questions',
		// 	githubUrl:
		// 		'https://github.com/raycast/extensions/tree/main/extensions/40-questions/',
		// 	image: 'https://files.raycast.com/cnpj978kwys39v4lll900b7d1wi6'
		// }
	];
</script>

<div class="container">
	<Heading>My Projects</Heading>

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
						{#if project.appUrl}
							<a
								href={project.appUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm hover:underline"
							>
								App →
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
