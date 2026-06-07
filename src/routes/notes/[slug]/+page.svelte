<script lang="ts">
	import Window from '$lib/components/ui/window/window.svelte';
	import { Heading } from '$lib/components/typography';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { onMount } from 'svelte';
	import { FileText, Search, ArrowLeft, Tag, Calendar, List, ExternalLink, Github } from 'lucide-svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { page } from '$app/state';
	import { MdSvelte } from '@jazzymcjazz/mdsvelte';
	import { renderers } from '$lib/components/typography';
	import { formatDate } from '$lib/utils/helper';
	import { Toc } from '$lib/components/ui/toc';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';

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
		notes.filter((n) => n.name.toLowerCase().includes(searchQuery.toLowerCase()))
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

{#snippet titlebarRight()}
	<Button
		variant="ghost"
		size="icon"
		href={note?.githubUrl}
		target="_blank"
		rel="noopener"
		disabled={!note?.githubUrl}
		title={i18n.t('notes.view_on_github') || 'View on GitHub'}
	>
		<Github class="size-4" />
	</Button>
	<Button
		variant="ghost"
		size="icon"
		href={note?.webUrl}
		target="_blank"
		rel="noopener"
		disabled={!note?.webUrl}
		title={i18n.t('notes.view_on_web') || 'View on Website'}
	>
		<ExternalLink class="size-4" />
	</Button>
{/snippet}

<div class="container mx-auto flex h-[calc(100vh-8rem)] flex-col p-4">
	<Window class="flex min-h-0 flex-grow flex-col overflow-hidden" {titlebarRight}>
		<div class="flex h-full flex-col divide-border overflow-hidden md:flex-row">
			<!-- Sidebar -->
			<div class="hidden h-full w-full flex-col overflow-hidden bg-muted/30 md:flex md:w-52 md:min-w-52">
				<div class="shrink-0 border-b border-border p-4">
					<div class="relative flex-grow">
						<Search class="absolute left-2 top-2.5 size-4 text-muted-foreground" />
						<input
							type="text"
							placeholder={i18n.t('notes.search_placeholder') || 'Search notes...'}
							bind:value={searchQuery}
							class="w-full rounded-md border border-border bg-background py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
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
										class="flex items-center gap-3 p-4 transition-colors hover:bg-muted {n.name ===
										slug
											? 'border-r-2 border-primary bg-muted'
											: ''}"
									>
										<FileText
											class="size-4 {n.name === slug ? 'text-primary' : 'text-muted-foreground'}"
										/>
										<span
											class="truncate text-sm font-medium {n.name === slug ? 'text-primary' : ''}"
											>{n.name}</span
										>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>

			<!-- Main Panel -->
			<div class="flex h-full flex-grow flex-col overflow-hidden lg:flex-row">
				<div id="notes-content-area" class="flex-grow overflow-y-auto p-4 md:p-8">
					<div class="mx-auto w-full max-w-3xl">
						{#if loadingNote}
							<div class="flex h-64 items-center justify-center">
								<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
							</div>
						{:else if note}
							<div class="mb-8">
								<div class="mb-4 flex items-center justify-between gap-4">
									<a
										href="/notes"
										class="flex items-center gap-1 text-primary hover:underline md:hidden"
									>
										<ArrowLeft class="size-4" />
										{i18n.t('notes.back_to_list') || 'Back'}
									</a>

									<!-- Mobile TOC Trigger -->
									<div class="lg:hidden">
										<Popover.Root>
											<Popover.Trigger asChild>
												{#snippet child({ props })}
													<Button variant="ghost" size="icon" {...props}>
														<List class="size-4" />
													</Button>
												{/snippet}
											</Popover.Trigger>
											<Popover.Content class="w-64 p-4">
												<Toc
													selector=".prose"
													rootSelector="#notes-content-area"
													content={processedContent}
												/>
											</Popover.Content>
										</Popover.Root>
									</div>
								</div>
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
													<span class="rounded-md bg-muted px-2 py-0.5">{tag}</span>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							</div>
							<div
								class="prose dark:prose-invert mb-12 max-w-none font-mono text-sm leading-relaxed"
							>
								<MdSvelte source={processedContent} {renderers} />
							</div>
						{:else}
							<div class="py-12 text-center">
								<Heading depth={2} class="mb-4"
									>{i18n.t('notes.not_found') || 'Note not found'}</Heading
								>
								<p class="mb-8">
									{i18n.t('notes.not_found_desc') || 'The requested note could not be loaded.'}
								</p>
								<a href="/notes" class="text-primary hover:underline"
									>{i18n.t('notes.back_to_list') || 'Return to overview'}</a
								>
							</div>
						{/if}
					</div>
				</div>
				<!-- TOC Sidebar (Desktop only) -->
				{#if note && !loadingNote}
					<aside
						class="hidden h-full w-56 shrink-0 overflow-y-auto border-l border-border p-8 lg:block"
					>
						<Toc selector=".prose" rootSelector="#notes-content-area" content={processedContent} />
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
