<script lang="ts">
	import Window from '$lib/components/ui/window/window.svelte';
	import { Heading } from '$lib/components/typography';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { onMount } from 'svelte';
	import { FileText, Search, ArrowLeft, Tag, Calendar } from 'lucide-svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { page } from '$app/state';
	import { MdSvelte } from '@jazzymcjazz/mdsvelte';
	import { renderers } from '$lib/components/typography';
	import { formatDate } from '$lib/utils/helper';
	import { Toc } from '$lib/components/ui/toc';

	let notes = $state<any[]>([]);
	let note = $state<any>(null);
	let loadingList = $state(true);
	let loadingNote = $state(true);
	let searchQuery = $state('');

	const slug = $derived(page.params.slug);

	async function fetchNote(currentSlug: string) {
		loadingNote = true;
		try {
			const response = await fetch(`/api/notes/${currentSlug}`);
			if (response.ok) {
				note = await response.json();
			} else {
				note = null;
			}
		} catch (error) {
			console.error('Failed to fetch note:', error);
			note = null;
		} finally {
			loadingNote = false;
		}
	}

	onMount(async () => {
		// Fetch notes list
		try {
			const response = await fetch('/api/notes');
			if (response.ok) {
				notes = await response.json();
			}
		} catch (error) {
			console.error('Failed to fetch notes:', error);
		} finally {
			loadingList = false;
		}

		// Fetch current note
		await fetchNote(slug);
	});

	$effect(() => {
		if (slug) {
			fetchNote(slug);
		}
	});

	const filteredNotes = $derived(
		notes.filter((n) =>
			n.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	// Pre-processor for wikilinks [[link]] or [[link|text]]
	function processContent(content: string) {
		if (!content) return '';
		return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, link, text) => {
			const label = text || link;
			const href = `/notes/${link.trim().replace(/\s+/g, '-')}`;
			return `[${label}](${href})`;
		});
	}

	const processedContent = $derived(processContent(note?.content || ''));
</script>

<svelte:head>
	<title>{note?.title || slug}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<div class="container mx-auto p-4 h-[calc(100vh-8rem)] flex flex-col">
	<Window class="flex-grow flex flex-col min-h-0 overflow-hidden">
		<div class="flex flex-col md:flex-row h-full divide-y md:divide-y-0 md:divide-x divide-border overflow-hidden">
			<!-- Sidebar -->
			<div class="w-full md:w-64 flex flex-col bg-muted/30 hidden md:flex h-full overflow-hidden">
				<div class="p-4 border-b border-border shrink-0">
					<div class="relative flex-grow">
						<Search class="absolute left-2 top-2.5 size-4 text-muted-foreground" />
						<input
							type="text"
							placeholder={i18n.t('notes.search_placeholder') || 'Search notes...'}
							bind:value={searchQuery}
							class="w-full pl-8 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
						/>
					</div>
				</div>
				<div class="flex-grow overflow-y-auto">
					{#if loadingList}
						<div class="p-4 text-center text-muted-foreground">
							{i18n.t('common.loading') || 'Loading...'}
						</div>
					{:else}
						<ul class="divide-y divide-border/50">
							{#each filteredNotes as n}
								<li>
									<a
										href="/notes/{n.name}"
										class="flex items-center gap-3 p-4 hover:bg-muted transition-colors {n.name === slug ? 'bg-muted border-r-2 border-primary' : ''}"
									>
										<FileText class="size-4 {n.name === slug ? 'text-primary' : 'text-muted-foreground'}" />
										<span class="text-sm font-medium truncate {n.name === slug ? 'text-primary' : ''}">{n.name}</span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>

			<!-- Main Panel -->
			<div class="flex-grow flex flex-col md:flex-row overflow-hidden h-full">
				<div class="flex-grow overflow-y-auto p-4 md:p-8">
					<div class="max-w-3xl mx-auto w-full">
						{#if loadingNote}
							<div class="flex items-center justify-center h-64">
								<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
							</div>
						{:else if note}
							<div class="mb-8">
								<div class="flex items-center gap-4 mb-4 md:hidden">
									<a href="/notes" class="text-primary hover:underline flex items-center gap-1">
										<ArrowLeft class="size-4" /> {i18n.t('notes.back_to_list') || 'Back'}
									</a>
								</div>
								<Heading class="mb-2">{note.title}</Heading>
								<div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
									{#if note.date}
										<div class="flex items-center gap-1">
											<Calendar class="size-4" />
											{formatDate(note.date)}
										</div>
									{/if}
									{#if note.tags && note.tags.length > 0}
										<div class="flex items-center gap-1">
											<Tag class="size-4" />
											<div class="flex gap-2">
												{#each note.tags as tag}
													<span class="bg-muted px-2 py-0.5 rounded-md">{tag}</span>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							</div>
							<div class="prose dark:prose-invert max-w-none font-mono text-sm leading-relaxed mb-12">
								<MdSvelte source={processedContent} {renderers} />
							</div>
						{:else}
							<div class="text-center py-12">
								<Heading depth={2} class="mb-4">{i18n.t('notes.not_found') || 'Note not found'}</Heading>
								<p class="mb-8">{i18n.t('notes.not_found_desc') || 'The requested note could not be loaded.'}</p>
								<a href="/notes" class="text-primary hover:underline">{i18n.t('notes.back_to_list') || 'Return to overview'}</a>
							</div>
						{/if}
					</div>
				</div>
				<!-- TOC Sidebar (Desktop only) -->
				{#if note && !loadingNote}
					<aside class="hidden xl:block w-64 p-8 border-l border-border h-full overflow-y-auto shrink-0">
						<Toc selector=".prose" />
					</aside>
				{/if}
			</div>
		</div>
	</Window>
</div>

<style>
	:global(.prose a) {
		color: hsl(var(--primary));
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	:global(.prose a:hover) {
		opacity: 0.8;
	}
	:global(.prose h1, .prose h2, .prose h3) {
		scroll-margin-top: 2rem;
	}
</style>
