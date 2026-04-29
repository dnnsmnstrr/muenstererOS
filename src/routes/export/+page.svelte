<script lang="ts">
	import { browser } from '$app/environment';
	import { Heading, Link } from '$lib/components/typography';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { toast } from 'svelte-sonner';
	import { Download, Loader2, Shield } from 'lucide-svelte';

	let includeStatic = $state(true);
	let includeGists = $state(true);
	let includeLocalStorage = $state(true);
	let githubToken = $state('');
	let isExporting = $state(false);

	$effect(() => {
		if (browser) {
			const savedToken = localStorage.getItem('github_admin_token');
			if (savedToken) {
				githubToken = savedToken;
			}
		}
	});

	async function handleExport() {
		isExporting = true;
		const toastId = toast.loading(i18n.t('export.downloading'));

		try {
			// 1. Fetch data from backend
			const queryParams = new URLSearchParams({
				static: includeStatic.toString(),
				gists: includeGists.toString()
			});

			const headers: Record<string, string> = {};
			if (githubToken) {
				headers['Authorization'] = `Bearer ${githubToken}`;
			}

			const response = await fetch(`/api/export?${queryParams.toString()}`, { headers });
			if (!response.ok) throw new Error('Failed to fetch export data from server');

			const data = await response.json();

			// 2. Add Local Storage if requested
			if (includeLocalStorage && browser) {
				const lsData: Record<string, any> = {};
				const keysToExport = [
					'theme',
					'desktopFiles',
					'backgroundTexture',
					'backgroundSize',
					'backgroundSpacing',
					'language',
					'debug',
					'dvdBounceEnabled'
				];

				keysToExport.forEach(key => {
					const value = localStorage.getItem(key);
					if (value !== null) {
						try {
							lsData[key] = JSON.parse(value);
						} catch (e) {
							lsData[key] = value;
						}
					}
				});
				data.localStorage = lsData;
				data.metadata.options.localStorage = true;
			} else {
				data.metadata.options.localStorage = false;
			}

			// 3. Trigger Download
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			a.href = url;
			a.download = `muenstererOS-export-${timestamp}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast.success(i18n.t('export.success'), { id: toastId });
		} catch (error) {
			console.error('Export failed:', error);
			toast.error(i18n.t('export.error', { error: error instanceof Error ? error.message : 'Unknown error' }), { id: toastId });
		} finally {
			isExporting = false;
		}
	}
</script>

<svelte:head>
	<title>{i18n.t('common.export')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<div class="container max-w-2xl py-10">
	<Card.Root>
		<Card.Header>
			<Card.Title>
				<Heading class="mb-0">{i18n.t('export.title')}</Heading>
			</Card.Title>
			<Card.Description>
				{i18n.t('export.description')}
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-6">
			<div class="space-y-4">
				<Heading depth={4}>{i18n.t('export.options')}</Heading>

				<div class="flex items-start space-x-3 space-y-0">
					<Checkbox id="static" bind:checked={includeStatic} />
					<div class="grid gap-1.5 leading-none">
						<Label for="static" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							{i18n.t('export.static_data')}
						</Label>
						<p class="text-sm text-muted-foreground">
							{i18n.t('export.static_data_description')}
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3 space-y-0">
					<Checkbox id="gists" bind:checked={includeGists} />
					<div class="grid gap-1.5 leading-none">
						<Label for="gists" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							{i18n.t('export.gists')}
						</Label>
						<p class="text-sm text-muted-foreground">
							{i18n.t('export.gists_description')}
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3 space-y-0">
					<Checkbox id="ls" bind:checked={includeLocalStorage} />
					<div class="grid gap-1.5 leading-none">
						<Label for="ls" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							{i18n.t('export.local_storage')}
						</Label>
						<p class="text-sm text-muted-foreground">
							{i18n.t('export.local_storage_description')}
						</p>
					</div>
				</div>
			</div>

			{#if includeGists}
				<div class="space-y-2 rounded-lg border bg-muted/30 p-4">
					<div class="flex items-center gap-2">
						<Shield class="h-4 w-4 text-muted-foreground" />
						<Label for="token" class="text-sm font-medium">{i18n.t('export.github_token')}</Label>
					</div>
					<Input
						id="token"
						type="password"
						placeholder="ghp_..."
						bind:value={githubToken}
						class="bg-background"
					/>
					<p class="text-xs text-muted-foreground">
						{i18n.t('export.github_token_description')}
					</p>
				</div>
			{/if}
		</Card.Content>
		<Card.Footer class="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:justify-between">
			<Link href="/admin" class="text-sm text-muted-foreground no-underline hover:underline">
				&larr; {i18n.t('common.admin')}
			</Link>
			<Button onclick={handleExport} disabled={isExporting} class="w-full sm:w-auto">
				{#if isExporting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{:else}
					<Download class="mr-2 h-4 w-4" />
				{/if}
				{i18n.t('export.generate')}
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
