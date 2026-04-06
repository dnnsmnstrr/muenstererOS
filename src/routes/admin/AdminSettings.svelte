<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { Badge } from '$lib/components/ui/badge';
	import { GitHubGistAPI } from '$lib/utils/github-api';
	import { BadgeHelp, Delete, Save, Settings } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import { i18n } from '$lib/i18n/i18n.svelte';

	/*
	 * Optimization: Internationalized the Admin Settings component.
	 * Moved hardcoded English strings for token validation, status badges, and dialog UI
	 * to the translation files (en.json and de.json) under the "admin" and "common" namespaces.
	 */

	// Props with bindable state
	let {
		githubToken = $bindable(''),
		tokenValidation = $bindable(null),
		isValidatingToken = $bindable(false)
	} = $props();

	// Local state
	let showTokenModal = $state(false);

	async function saveTokenToStorage() {
		if (browser && githubToken) {
			localStorage.setItem('github_admin_token', githubToken);
			toast.success(i18n.t('admin.settings.save_success'));
			await validateToken();
			if (tokenValidation && tokenValidation.valid) {
				showTokenModal = false;
			}
		}
	}

	async function validateToken() {
		if (!githubToken) {
			tokenValidation = null;
			return;
		}

		isValidatingToken = true;
		try {
			const api = new GitHubGistAPI(githubToken);
			tokenValidation = await api.validateToken();

			if (tokenValidation.valid) {
				toast.success(i18n.t('admin.settings.validation_success'));
			} else {
				toast.error(tokenValidation.error || i18n.t('admin.settings.validation_failed'));
			}
		} catch (error) {
			tokenValidation = {
				valid: false,
				error: error instanceof Error ? error.message : i18n.t('admin.settings.fetch_failed')
			};
			toast.error(i18n.t('admin.settings.fetch_failed'));
		} finally {
			isValidatingToken = false;
		}
	}

	function clearToken() {
		githubToken = '';
		tokenValidation = null;
		if (browser) {
			localStorage.removeItem('github_admin_token');
		}
		toast.success(i18n.t('admin.settings.cleared'));
		showTokenModal = false;
	}
</script>

<div class="flex items-center gap-2">
	<Badge variant="outline" class="hidden text-xs sm:inline-flex">
		{#if isValidatingToken}
			{i18n.t('admin.status.validating')}
		{:else if tokenValidation}
			<span class="mr-1.5 {tokenValidation.valid ? 'text-green-500' : 'text-red-500'}">
				{tokenValidation.valid ? '✓' : '✗'}
			</span>
			{tokenValidation.valid ? i18n.t('admin.status.valid') : i18n.t('admin.status.invalid')}
		{:else}
			{githubToken ? i18n.t('admin.status.set') : i18n.t('admin.status.none')}
		{/if}
	</Badge>

	<Dialog bind:open={showTokenModal}>
		<DialogTrigger>
			<Button variant="outline" size="sm">
				<Settings class="mr-1 h-4 w-4" />
				{i18n.t('common.settings')}
			</Button>
		</DialogTrigger>
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>{i18n.t('admin.settings.title')}</DialogTitle>
			</DialogHeader>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="token">{i18n.t('admin.settings.label')}</Label>
					<div class="flex gap-2">
						<Input
							id="token"
							type="password"
							placeholder={i18n.t('admin.settings.placeholder')}
							bind:value={githubToken}
							onkeypress={(e) => {
								console.log(e);
								if (e.key === 'Enter') {
									e.preventDefault();
									saveTokenToStorage();
								}
							}}
							class="flex-1"
						/>
					</div>
					<p class="text-xs text-muted-foreground">
						{i18n.t('admin.settings.description')} <a
							href="https://github.com/settings/tokens/new?scopes=gist"
							target="_blank"
							class="underline hover:text-foreground"
						>
							{i18n.t('admin.settings.create_link')}
						</a>
					</p>
					{#if tokenValidation && !tokenValidation.valid}
						<p class="text-xs text-red-600">
							❌ {tokenValidation.error}
						</p>
					{:else if tokenValidation && tokenValidation.valid}
						<p class="text-xs text-green-600">
							✅ {i18n.t('admin.settings.validation_success')}
							{#if tokenValidation.scopes}
								<br />{i18n.t('admin.settings.scopes')}: {tokenValidation.scopes.join(', ')}
							{/if}
						</p>
					{/if}
				</div>
				<div class="flex gap-2">
					<Button onclick={saveTokenToStorage} variant="outline" size="sm" class="flex-1">
						<Save class="mr-1 h-4 w-4" />
						{i18n.t('admin.settings.save')}
					</Button>
					<Button
						onclick={validateToken}
						variant="outline"
						size="sm"
						disabled={!githubToken || isValidatingToken}
						class="flex-1"
					>
						<BadgeHelp class="mr-1 h-4 w-4" />
						{i18n.t('admin.settings.validate')}
					</Button>
					<Button onclick={clearToken} variant="outline" size="sm" class="flex-1">
						<Delete class="mr-1 h-4 w-4" />
						{i18n.t('admin.settings.clear')}
					</Button>
				</div>
			</div>
		</DialogContent>
	</Dialog>
</div>
