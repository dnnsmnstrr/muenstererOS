<script lang="ts">
	import { page } from '$app/state';
	import NotesLayout from '../NotesLayout.svelte';
	import { Heading, renderers } from '$lib/components/typography';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { Toc } from '$lib/components/ui/toc';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { formatDate } from '$lib/utils/helper';
	import { MdSvelte } from '@jazzymcjazz/mdsvelte';
	import { ArrowLeft, Calendar, ExternalLink, Github, List, Tag } from 'lucide-svelte';
	import { onMount } from 'svelte';

	type NoteListItem = { name: string };
	type Note = {
		title?: string;
		content?: string;
		date?: string;
		tags?: string[];
		githubUrl?: string;
		webUrl?: string;
	};

	let notes = $state<NoteListItem[]>([]);
	let note = $state<Note | null>(null);
	let loadingList = $state(true);
	let loadingNote = $state(true);
	let searchQuery = $state('');
	const slug = $derived(page.params.slug);

	async function fetchNote(currentSlug: string) {
		loadingNote = true;
		try {
			const response = await fetch(`/api/notes/${currentSlug}`);
			note = response.ok ? await response.json() : null;
		} catch (error) {
			console.error('Failed to fetch note:', error);
			note = null;
		} finally {
			loadingNote = false;
		}
	}

	onMount(async () => {
		try {
			const response = await fetch('/api/notes');
			if (response.ok) notes = await response.json();
		} catch (error) {
			console.error('Failed to fetch notes:', error);
		} finally {
			loadingList = false;
		}
	});

	$effect(() => {
		if (slug) fetchNote(slug);
	});

	function processContent(content: string) {
		return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, link, text) => {
			const href = `/notes/${link.trim().replace(/\s+/g, '-')}`;
			return `[${text || link}](${href})`;
		});
	}

	const processedContent = $derived(processContent(note?.content || ''));
</script>

<svelte:head>
	<title>{note?.title || slug}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

{#snippet noteActions()}
	<Button variant="ghost" size="icon" href={note?.githubUrl} target="_blank" rel="noopener" disabled={!note?.githubUrl} title={i18n.t('notes.view_on_github') || 'View on GitHub'}>
		<Github class="size-4" />
	</Button>
	<Button variant="ghost" size="icon" href={note?.webUrl} target="_blank" rel="noopener" disabled={!note?.webUrl} title={i18n.t('notes.view_on_web') || 'View on Website'}>
		<ExternalLink class="size-4" />
	</Button>
{/snippet}

<NotesLayout
	{notes}
	loading={loadingList}
	activeSlug={slug}
	title={note?.title || slug}
	bind:searchQuery
	collapsibleSidebar
	titlebarRight={noteActions}
	toolbarActions={noteActions}
>
	<div class="flex h-full flex-grow flex-col overflow-hidden bg-background lg:flex-row">
		<div id="notes-content-area" class="flex-grow overflow-y-auto p-4 md:p-8">
			<div class="mx-auto w-full max-w-3xl">
				{#if loadingNote}
					<div class="flex h-64 items-center justify-center">
						<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
					</div>
				{:else if note}
					<div class="mb-8">
						<div class="mb-4 flex items-center justify-between gap-4">
							<a href="/notes" class="flex items-center gap-1 text-primary hover:underline md:hidden">
								<ArrowLeft class="size-4" />
								{i18n.t('notes.back_to_list') || 'Back'}
							</a>
							<div class="lg:hidden">
								<Popover.Root>
									<Popover.Trigger asChild>
										{#snippet child({ props })}<Button variant="ghost" size="icon" {...props}><List class="size-4" /></Button>{/snippet}
									</Popover.Trigger>
									<Popover.Content class="w-64 p-4">
										<Toc selector=".prose" rootSelector="#notes-content-area" content={processedContent} />
									</Popover.Content>
								</Popover.Root>
							</div>
						</div>
						<div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
							{#if note.date}<div class="flex items-center gap-1"><Calendar class="size-4" />{formatDate(note.date)}</div>{/if}
							{#if note.tags?.length}
								<div class="flex items-center gap-1">
									<Tag class="size-4" />
									<div class="flex gap-2">{#each note.tags as tag}<span class="rounded-md bg-muted px-2 py-0.5">{tag}</span>{/each}</div>
								</div>
							{/if}
						</div>
					</div>
					<div class="prose dark:prose-invert mb-12 max-w-none font-mono text-sm leading-relaxed">
						<MdSvelte source={processedContent} {renderers} />
					</div>
				{:else}
					<div class="py-12 text-center">
						<Heading depth={2} class="mb-4">{i18n.t('notes.not_found') || 'Note not found'}</Heading>
						<p class="mb-8">{i18n.t('notes.not_found_desc') || 'The requested note could not be loaded.'}</p>
						<a href="/notes" class="text-primary hover:underline">{i18n.t('notes.back_to_list') || 'Return to overview'}</a>
					</div>
				{/if}
			</div>
		</div>
		{#if note && !loadingNote}
			<aside class="hidden h-full w-56 shrink-0 overflow-y-auto border-l border-border bg-background p-8 lg:block">
				<Toc selector=".prose" rootSelector="#notes-content-area" content={processedContent} />
			</aside>
		{/if}
	</div>
</NotesLayout>

<style>
	:global(.prose a) { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 4px; }
	:global(.prose a:hover) { opacity: 0.8; }
	:global(.prose h1, .prose h2, .prose h3) { scroll-margin-top: 2rem; }
	:global(.prose table) { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
	:global(.prose th, .prose td) { border: 1px solid hsl(var(--border)); padding: 0.5rem 0.75rem; text-align: left; }
	:global(.prose th) { background-color: hsl(var(--muted) / 0.5); font-weight: 600; }
	:global(.prose tr:nth-child(even)) { background-color: hsl(var(--muted) / 0.2); }
</style>
