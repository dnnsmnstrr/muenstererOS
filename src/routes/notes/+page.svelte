<script lang="ts">
	import Window from '$lib/components/ui/window/window.svelte';
	import { Heading } from '$lib/components/typography';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { onMount } from 'svelte';
	import { FileText, Search, Minimize2 } from 'lucide-svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { isNotesMaximized } from '$lib/stores/notes';
	import { Button } from '$lib/components/ui/button';

	let notes = $state<any[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');

	let isMaximized = $state(false);

	isNotesMaximized.subscribe((val) => {
		isMaximized = val;
	});

	function toggleMaximize(val: boolean) {
		isNotesMaximized.set(val);
	}

	onMount(async () => {
		try {
			const response = await fetch('/api/notes');
			if (response.ok) {
				notes = await response.json();
			}
		} catch (error) {
			console.error('Failed to fetch notes:', error);
		} finally {
			loading = false;
		}
	});

	const filteredNotes = $derived(
		notes.filter((note) =>
			note.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);
</script>

<svelte:head>
	<title>{i18n.t('notes.title')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

{#if isMaximized}
	<!-- Maximized layout for notes overview (full width) -->
	<div class="fixed inset-x-0 bottom-0 top-[5.5rem] z-40 flex flex-col bg-background p-0 pb-4">
		<!-- Toolbar for Maximized Mode -->
		<div class="flex items-center justify-between border-b border-border bg-background px-4 py-2 sm:px-8 shrink-0">
			<span class="text-sm font-semibold tracking-tight text-muted-foreground">
				{i18n.t('notes.title') || 'Notes'}
			</span>
			<div class="flex items-center gap-2">
				<!-- Restore Button -->
				<Button
					variant="ghost"
					size="icon"
					onclick={() => toggleMaximize(false)}
					title={i18n.t('window.restore') || 'Restore Window'}
					class="size-8"
				>
					<Minimize2 class="size-5" />
				</Button>
			</div>
		</div>

		<!-- Inner maximized container -->
		<div class="flex flex-grow min-h-0 overflow-hidden divide-x divide-border">
			<!-- Sidebar -->
			<div class="w-full md:w-64 flex flex-col bg-muted/30 h-full overflow-hidden shrink-0">
				<div class="p-4 border-b border-border shrink-0">
					<div class="relative">
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
										class="flex items-center gap-3 p-4 hover:bg-muted transition-colors"
									>
										<FileText class="size-4 text-muted-foreground" />
										<span class="text-sm font-medium truncate">{note.name}</span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>

			<!-- Main Panel -->
			<div class="hidden md:flex flex-grow flex-col overflow-y-auto p-8 h-full bg-background">
				<div class="max-w-3xl mx-auto w-full">
					<Heading class="mb-8">{i18n.t('notes.title') || 'Notes'}</Heading>
					<div class="prose dark:prose-invert">
						<p class="text-muted-foreground">
							{i18n.t('notes.welcome') || 'Select a note from the sidebar to start reading.'}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{:else}
	<!-- Standard Window layout -->
	<div class="container mx-auto p-4 h-[calc(100vh-8rem)] flex flex-col">
		<Window class="flex-grow flex flex-col min-h-0 overflow-hidden" onMaximize={() => toggleMaximize(true)} {isMaximized}>
			<div class="flex flex-col md:flex-row h-full md:divide-x divide-border">
				<!-- Sidebar -->
				<div class="w-full md:w-64 flex flex-col bg-muted/30 h-full overflow-hidden">
					<div class="p-4 border-b border-border shrink-0">
						<div class="relative">
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
											class="flex items-center gap-3 p-4 hover:bg-muted transition-colors"
										>
											<FileText class="size-4 text-muted-foreground" />
											<span class="text-sm font-medium truncate">{note.name}</span>
										</a>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>

				<!-- Main Panel - Hidden on mobile -->
				<div class="hidden md:flex flex-grow flex-col overflow-y-auto p-8 h-full">
					<div class="max-w-3xl mx-auto w-full">
						<Heading class="mb-8">{i18n.t('notes.title') || 'Notes'}</Heading>
						<div class="prose dark:prose-invert">
							<p class="text-muted-foreground">
								{i18n.t('notes.welcome') || 'Select a note from the sidebar to start reading.'}
							</p>
						</div>
					</div>
				</div>
			</div>
		</Window>
	</div>
{/if}
