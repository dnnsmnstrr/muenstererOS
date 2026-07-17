<script lang="ts">
	import NotesLayout from './NotesLayout.svelte';
	import { Heading } from '$lib/components/typography';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { ArrowRight, FileText } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let notes = $state<{ name: string }[]>([]);
	let recommendations = $state<{ slug: string; reason?: string }[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');

	onMount(async () => {
		try {
			const response = await fetch('/api/notes');
			if (response.ok) notes = await response.json();
			const recResponse = await fetch('/api/notes/recommendations');
			if (recResponse.ok) {
				recommendations = await recResponse.json();
			}
		} catch (error) {
			console.error('Failed to fetch notes:', error);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>{i18n.t('notes.title')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<NotesLayout
	{notes}
	{loading}
	bind:searchQuery
	title={i18n.t('notes.title') || 'Notes'}
>
	<div class="hidden h-full flex-grow flex-col overflow-y-auto bg-background p-8 md:flex">
		<div class="mx-auto w-full max-w-3xl">
			<Heading class="mb-8">{i18n.t('notes.title') || 'Notes'}</Heading>
			<p class="mb-10 text-muted-foreground">
				{i18n.t('notes.welcome') || 'Select a note from the sidebar to start reading.'}
			</p>

			{#if recommendations.length > 0}
				<section aria-labelledby="recommendations-heading">
					<Heading id="recommendations-heading" depth={2} class="mb-4">Recommendations</Heading>
					<ul class="grid gap-3">
						{#each recommendations as recommendation}
							<li>
								<a
									href="/notes/{recommendation.slug}"
									class="group flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
								>
									<FileText class="size-5 shrink-0 text-muted-foreground group-hover:text-primary" />
									<div class="min-w-0 flex-grow">
										<p class="truncate font-medium">{recommendation.slug}</p>
										{#if recommendation.reason}
											<p class="mt-1 text-sm text-muted-foreground">{recommendation.reason}</p>
										{/if}
									</div>
									<ArrowRight class="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		</div>
	</div>
</NotesLayout>
