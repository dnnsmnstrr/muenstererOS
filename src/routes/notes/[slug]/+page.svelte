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
	import { ArrowLeft, ArrowRight, Calendar, ExternalLink, FileText, Github, List, Tag } from 'lucide-svelte';
	import { onMount } from 'svelte';

	type NoteListItem = { name: string };
	type Backlink = { slug: string; title: string };
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
	let previousTitle = $state('');
	let nextTitle = $state('');
	let backlinks = $state<Backlink[]>([]);
	let navigationRequest = 0;
	let backlinkRequest = 0;
	const slug = $derived(page.params.slug);
	const currentNoteIndex = $derived(notes.findIndex((item) => item.name === slug));
	const previousNote = $derived(currentNoteIndex > 0 ? notes[currentNoteIndex - 1] : null);
	const nextNote = $derived(
		currentNoteIndex >= 0 && currentNoteIndex < notes.length - 1
			? notes[currentNoteIndex + 1]
			: null
	);

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

	async function fetchNavigationTitles(previous: NoteListItem | null, next: NoteListItem | null) {
		const request = ++navigationRequest;
		previousTitle = previous?.name || '';
		nextTitle = next?.name || '';

		const fetchTitle = async (item: NoteListItem | null) => {
			if (!item) return '';
			try {
				const response = await fetch(`/api/notes/${encodeURIComponent(item.name)}`);
				if (!response.ok) return item.name;
				const adjacentNote: Note = await response.json();
				return adjacentNote.title || item.name;
			} catch {
				return item.name;
			}
		};

		const [resolvedPreviousTitle, resolvedNextTitle] = await Promise.all([
			fetchTitle(previous),
			fetchTitle(next)
		]);
		if (request !== navigationRequest) return;

		previousTitle = resolvedPreviousTitle;
		nextTitle = resolvedNextTitle;
	}

	async function fetchBacklinks(currentSlug: string) {
		const request = ++backlinkRequest;
		backlinks = [];
		try {
			const response = await fetch(`/api/notes/${encodeURIComponent(currentSlug)}/backlinks`);
			const result: Backlink[] = response.ok ? await response.json() : [];
			if (request === backlinkRequest) backlinks = result;
		} catch (error) {
			console.error('Failed to fetch backlinks:', error);
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
		if (slug) {
			fetchNote(slug);
			fetchBacklinks(slug);
		}
	});

	$effect(() => {
		void fetchNavigationTitles(previousNote, nextNote);
	});

	function processContent(content: string) {
		return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, link, text) => {
			const href = `/notes/${link.trim().replace(/\s+/g, '-')}`;
			return `[${text || link}](${href})`;
		});
	}

	function extractReferencedNotes(content: string) {
		const references = new Map<string, string>();
		const noteLinkPattern = /\[([^\]]+)\]\((\/notes\/[^\s)#?]+)(?:[?#][^)]*)?\)/g;

		for (const match of content.matchAll(noteLinkPattern)) {
			const [, title, href] = match;
			if (href !== `/notes/${encodeURIComponent(slug)}`) references.set(href, title);
		}

		return Array.from(references, ([href, title]) => ({ href, title }));
	}

	const processedContent = $derived(processContent(note?.content || ''));
	const referencedNotes = $derived(extractReferencedNotes(processedContent));
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
					<nav class="flex items-stretch justify-between gap-4 border-t border-border pt-6" aria-label="Note navigation">
						{#if previousNote}
							<Button variant="outline" href="/notes/{encodeURIComponent(previousNote.name)}" class="h-auto min-w-0 max-w-[48%] justify-start px-4 py-3 text-left whitespace-normal">
								<ArrowLeft class="size-4 shrink-0" />
								<span class="min-w-0">
									<span class="block text-xs text-muted-foreground">{i18n.t('notes.previous') || 'Previous'}</span>
									<span class="block truncate">{previousTitle}</span>
								</span>
							</Button>
						{/if}
						{#if nextNote}
							<Button variant="outline" href="/notes/{encodeURIComponent(nextNote.name)}" class="ml-auto h-auto min-w-0 max-w-[48%] justify-end px-4 py-3 text-right whitespace-normal">
								<span class="min-w-0">
									<span class="block text-xs text-muted-foreground">{i18n.t('notes.next') || 'Next'}</span>
									<span class="block truncate">{nextTitle}</span>
								</span>
								<ArrowRight class="size-4 shrink-0" />
							</Button>
						{/if}
					</nav>
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
				{#if backlinks.length > 0}
					<nav class="mt-6 border-t border-border pt-6" aria-label={i18n.t('notes.backlinks') || 'Backlinks'}>
						<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							{i18n.t('notes.backlinks') || 'Backlinks'}
						</p>
						<ul class="space-y-2 text-sm">
							{#each backlinks as backlink}
								<li>
									<a href="/notes/{encodeURIComponent(backlink.slug)}" class="flex items-start gap-2 py-1 text-muted-foreground transition-colors hover:text-primary">
										<FileText class="mt-0.5 size-4 shrink-0" />
										<span class="min-w-0 break-words">{backlink.title}</span>
									</a>
								</li>
							{/each}
						</ul>
					</nav>
				{/if}
				{#if referencedNotes.length > 0}
					<nav class="mt-6 border-t border-border pt-6" aria-label={i18n.t('notes.referenced_pages') || 'Referenced pages'}>
						<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							{i18n.t('notes.referenced_pages') || 'Referenced pages'}
						</p>
						<ul class="space-y-2 text-sm">
							{#each referencedNotes as reference}
								<li>
									<a href={reference.href} class="flex items-start gap-2 py-1 text-muted-foreground transition-colors hover:text-primary">
										<FileText class="mt-0.5 size-4 shrink-0" />
										<span class="min-w-0 break-words">{reference.title}</span>
									</a>
								</li>
							{/each}
						</ul>
					</nav>
				{/if}
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
