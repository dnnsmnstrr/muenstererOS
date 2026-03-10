<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { Badge } from '$lib/components/ui/badge';
	import { GitHubGistAPI } from '$lib/utils/github-api';
	import { BadgeHelp, Delete, Save, Settings } from 'lucide-svelte';
	import { browser } from '$app/environment';

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
			toast.success('Token saved locally');
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
				toast.success('Token is valid and has required permissions');
			} else {
				toast.error(tokenValidation.error || 'Token validation failed');
			}
		} catch (error) {
			tokenValidation = {
				valid: false,
				error: error instanceof Error ? error.message : 'Validation failed'
			};
			toast.error('Failed to validate token');
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
		toast.success('Token cleared');
		showTokenModal = false;
	}
</script>

<div class="flex items-center gap-2">
	<Badge variant="outline" class="text-xs hidden sm:inline-flex">
		{#if isValidatingToken}
			Validating...
		{:else if tokenValidation}
			{tokenValidation.valid ? '✓ Valid Token' : '✗ Invalid Token'}
		{:else}
			{githubToken ? 'Token Set' : 'No Token'}
		{/if}
	</Badge>
	
	<Dialog bind:open={showTokenModal}>
		<DialogTrigger>
			<Button variant="outline" size="sm">
				<Settings class="h-4 w-4 mr-1" />
				Settings
			</Button>
		</DialogTrigger>
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>GitHub Access Token</DialogTitle>
			</DialogHeader>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="token">Personal Access Token</Label>
					<div class="flex gap-2">
						<Input
							id="token"
							type="password"
							placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
							bind:value={githubToken}
                            onsubmit={(e) => {
                                e.preventDefault();
                                saveTokenToStorage();
                            }}
							class="flex-1"
						/>
					</div>
					<p class="text-xs text-muted-foreground">
						Token needs 'gist' scope. <a 
							href="https://github.com/settings/tokens/new?scopes=gist" 
							target="_blank" 
							class="underline hover:text-foreground"
						>
							Create one here
						</a>
					</p>
					{#if tokenValidation && !tokenValidation.valid}
						<p class="text-xs text-red-600">
							❌ {tokenValidation.error}
						</p>
					{:else if tokenValidation && tokenValidation.valid}
						<p class="text-xs text-green-600">
							✅ Token is valid and has required permissions
							{#if tokenValidation.scopes}
								<br>Scopes: {tokenValidation.scopes.join(', ')}
							{/if}
						</p>
					{/if}
				</div>
				<div class="flex gap-2">
					<Button onclick={saveTokenToStorage} variant="outline" size="sm" class="flex-1">
						<Save class="h-4 w-4 mr-1" />
						Save
					</Button>
					<Button onclick={validateToken} variant="outline" size="sm" disabled={!githubToken || isValidatingToken} class="flex-1">
						<BadgeHelp class="h-4 w-4 mr-1" />
						Validate
					</Button>
					<Button onclick={clearToken} variant="outline" size="sm" class="flex-1">
						<Delete class="h-4 w-4 mr-1" />
						Clear
					</Button>
				</div>
			</div>
		</DialogContent>
	</Dialog>
</div>
