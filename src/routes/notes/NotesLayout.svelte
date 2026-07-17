<script lang="ts">
	import Window from '$lib/components/ui/window/window.svelte';
	import { Button } from '$lib/components/ui/button';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { isNotesMaximized, isNotesSidebarCollapsed } from '$lib/stores/notes';
	import { FileText, Minimize2, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-svelte';
	import { onDestroy, type Snippet } from 'svelte';

	interface NoteListItem {
		name: string;
	}

	let {
		notes,
		loading,
		activeSlug,
		title,
		searchQuery = $bindable(''),
		collapsibleSidebar = false,
		titlebarRight,
		toolbarActions,
		children
	}: {
		notes: NoteListItem[];
		loading: boolean;
		activeSlug?: string;
		title: string;
		searchQuery?: string;
		collapsibleSidebar?: boolean;
		titlebarRight?: Snippet;
		toolbarActions?: Snippet;
		children: Snippet;
	} = $props();

	let isMaximized = $state(false);
	let isSidebarCollapsed = $state(false);

	const unsubscribeMaximized = isNotesMaximized.subscribe((value) => (isMaximized = value));
	const unsubscribeSidebar = isNotesSidebarCollapsed.subscribe(
		(value) => (isSidebarCollapsed = value)
	);

	onDestroy(() => {
		unsubscribeMaximized();
		unsubscribeSidebar();
	});

	const filteredNotes = $derived(
		notes.filter((note) => note.name.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	function toggleMaximize(value: boolean) {
		isNotesMaximized.set(value);
	}

	function toggleSidebar(value: boolean) {
		isNotesSidebarCollapsed.set(value);
	}
</script>

{#snippet sidebar()}
	<div class="flex h-full w-full shrink-0 flex-col overflow-hidden bg-muted/30 md:w-64 md:min-w-64">
		<div class="shrink-0 border-b border-border p-4">
			<div class="relative">
				<Search class="absolute left-2 top-2.5 size-4 text-muted-foreground" />
				<input
					type="search"
					placeholder={i18n.t('notes.search_placeholder') || 'Search notes...'}
					bind:value={searchQuery}
					class="w-full rounded-md border border-border bg-background py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
				/>
			</div>
		</div>
		<div class="flex-grow overflow-y-auto">
			{#if loading}
				<div class="p-4 text-center text-muted-foreground">
					{i18n.t('common.loading') || 'Loading...'}
				</div>
			{:else if filteredNotes.length === 0}
				<div class="p-4 text-center text-muted-foreground">
					{i18n.t('notes.no_notes') || 'No notes found'}
				</div>
			{:else}
				<ul class="divide-y divide-border/50">
					{#each filteredNotes as note}
						<li>
							<a
								href="/notes/{note.name}"
								class="flex items-center gap-3 p-4 transition-colors hover:bg-muted {note.name === activeSlug ? 'border-r-2 border-primary bg-muted' : ''}"
							>
								<FileText class="size-4 {note.name === activeSlug ? 'text-primary' : 'text-muted-foreground'}" />
								<span class="truncate text-sm font-medium {note.name === activeSlug ? 'text-primary' : ''}">{note.name}</span>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet body(maximized: boolean)}
	<div class="flex h-full min-h-0 flex-grow overflow-hidden divide-x divide-border">
		{#if !collapsibleSidebar || !maximized || !isSidebarCollapsed}
			<div class={activeSlug ? 'hidden md:flex' : 'flex'}>
				{@render sidebar()}
			</div>
		{/if}
		{@render children()}
	</div>
{/snippet}

{#if isMaximized}
	<div class="fixed inset-x-0 bottom-0 top-[5.5rem] z-40 flex flex-col bg-background pb-4">
		<div class="flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-2 sm:px-8">
			<div class="flex min-w-0 items-center gap-2">
				{#if collapsibleSidebar}
					<Button
						variant="ghost"
						size="icon"
						onclick={() => toggleSidebar(!isSidebarCollapsed)}
						title={isSidebarCollapsed ? i18n.t('notes.expand_sidebar') || 'Expand Sidebar' : i18n.t('notes.collapse_sidebar') || 'Collapse Sidebar'}
						class="hidden size-8 md:inline-flex"
					>
						{#if isSidebarCollapsed}<PanelLeftOpen class="size-5" />{:else}<PanelLeftClose class="size-5" />{/if}
					</Button>
				{/if}
				<span class="truncate text-sm font-semibold tracking-tight text-muted-foreground">{title}</span>
			</div>
			<div class="flex items-center gap-2">
				{@render toolbarActions?.()}
				{#if toolbarActions}<div class="mx-1 h-4 w-px bg-border"></div>{/if}
				<Button variant="ghost" size="icon" onclick={() => toggleMaximize(false)} title={i18n.t('window.restore') || 'Restore Window'} class="size-8">
					<Minimize2 class="size-5" />
				</Button>
			</div>
		</div>
		{@render body(true)}
	</div>
{:else}
	<div class="container mx-auto flex h-[calc(100vh-8rem)] flex-col p-4">
		<Window class="flex min-h-0 flex-grow flex-col overflow-hidden" childClassName="p-0" onMaximize={() => toggleMaximize(true)} {isMaximized} {titlebarRight}>
			{@render body(false)}
		</Window>
	</div>
{/if}
