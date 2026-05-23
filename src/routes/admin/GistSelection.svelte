<script lang="ts">
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronDown } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import type { GistData } from '$lib/utils/github-api';
	import { Input } from '$lib/components/ui/input';
	import { i18n } from '$lib/i18n/i18n.svelte';

	/*
	 * Optimization: Internationalized the Gist Selection component.
	 * Moved labels for Gist ID, Filename, and the load state buttons
	 * to the translation files for multi-language support.
	 */

	let {
		open = $bindable(false),
		loading = false,
		selectedGist = $bindable(''),
		customGistId = $bindable(''),
		customFilename = $bindable(''),
		availableGists = [],
		onLoadGist
	} = $props();
</script>

<Card>
	<Collapsible.Root bind:open>
		<CardHeader class="p-0">
			<Collapsible.Trigger class="p-0">
				<Button
					variant="ghost"
					class="w-full justify-between p-6 font-semibold hover:bg-transparent"
				>
					{i18n.t('admin.gist_selection.title')}
					<ChevronDown
						class="h-4 w-4 transition-transform duration-200 {open ? 'rotate-180' : ''}"
					/>
				</Button>
			</Collapsible.Trigger>
		</CardHeader>
		<Collapsible.Content>
			<CardContent class="space-y-4">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div class="space-y-2">
						<Label>{i18n.t('admin.gist_selection.gist_label')}</Label>
						<select
							bind:value={selectedGist}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#each availableGists as gist}
								<option value={gist.id}>{gist.name}</option>
							{/each}
						</select>
					</div>

					{#if selectedGist === ''}
						<div class="space-y-2">
							<Label for="customGistId">{i18n.t('admin.gist_selection.custom_id')}</Label>
							<Input
								id="customGistId"
								placeholder="f18bfa6e4f02dc480426d05cf7adff79"
								bind:value={customGistId}
							/>
						</div>
						<div class="space-y-2">
							<Label for="customFilename">{i18n.t('admin.gist_selection.filename')}</Label>
							<Input id="customFilename" placeholder="data.json" bind:value={customFilename} />
						</div>
					{:else}
						<div class="space-y-2">
							<Label>{i18n.t('admin.gist_selection.filename')}</Label>
							<Input
								value={availableGists.find((g) => g.id === selectedGist)?.filename || ''}
								disabled
							/>
						</div>
						<div class="space-y-2">
							<Label>{i18n.t('admin.gist_selection.id_label')}</Label>
							<Input value={selectedGist} disabled />
						</div>
					{/if}
				</div>

				<Button onclick={onLoadGist} disabled={loading || !onLoadGist} class="w-full">
					{loading ? i18n.t('admin.gist_selection.loading') : i18n.t('admin.gist_selection.load')}
				</Button>
			</CardContent>
		</Collapsible.Content>
	</Collapsible.Root>
</Card>
