<script lang="ts">
	import Window from '$lib/components/ui/window/window.svelte';
	import { Heading } from '$lib/components/typography';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { onMount } from 'svelte';
	import { FileText, Search } from 'lucide-svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';

	let notes = $state<any[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');

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

<div class="container mx-auto p-4 h-[calc(100vh-8rem)] flex flex-col">
	<Window class="flex-grow flex flex-col min-h-0 overflow-hidden">
		<div class="flex flex-col md:flex-row h-full divide-y md:divide-y-0 md:divide-x divide-border">
			<!-- Sidebar -->
			<div class="w-full md:w-64 flex flex-col bg-muted/30 h-1/3 md:h-full overflow-hidden">
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
			<div class="flex-grow flex flex-col overflow-y-auto p-8 h-2/3 md:h-full">
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
