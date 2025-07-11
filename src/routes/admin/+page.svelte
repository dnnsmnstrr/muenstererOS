<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import JsonEditor from '$lib/components/JsonEditor.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { Badge } from '$lib/components/ui/badge';
	import { NOW_GIST_ID, RESUME_GIST_ID } from '$lib/config';
	import { GitHubGistAPI } from '$lib/utils/github-api';
	import { BadgeHelp, Delete, Save, Settings } from 'lucide-svelte';
	import { Heading } from '$lib/components/typography';

	// State management
	let githubToken = $state('');
	let selectedGist = $state('');
	let gistData = $state('{}');
	let gistInfo = $state<any>(null);
	let isLoading = $state(false);
	let isSaving = $state(false);
	let isValidatingToken = $state(false);
	let tokenValidation = $state<{ valid: boolean; scopes?: string[]; error?: string } | null>(null);
	let showTokenModal = $state(false);
	
	let jsonEditor = $state<JsonEditor | null>(null);

	// Predefined gists
	const knownGists = [
		{ id: NOW_GIST_ID, name: 'Now Data', filename: 'now.json' },
		{ id: RESUME_GIST_ID, name: 'Resume Data', filename: 'resume.json' },
		{ id: '', name: 'Custom Gist...', filename: '' }
	];

	// Custom gist fields for when user selects "Custom Gist..."
	let customGistId = $state('');
	let customFilename = $state('');

	onMount(() => {
		// Load saved token from localStorage
		if (browser) {
			const savedToken = localStorage.getItem('github_admin_token');
			if (savedToken) {
				githubToken = savedToken;
				validateToken(); // Validate the loaded token
			}
		}
	});

	function saveTokenToStorage() {
		if (browser && githubToken) {
			localStorage.setItem('github_admin_token', githubToken);
			toast.success('Token saved locally');
			validateToken(); // Validate token after saving
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
		showTokenModal = false; // Close modal after clearing
	}

	async function loadGist() {
		if (!githubToken) {
			toast.error('Please enter a GitHub token first');
			return;
		}

		const gistId = selectedGist === '' ? customGistId : selectedGist;
		const filename = selectedGist === '' ? customFilename : 
			knownGists.find(g => g.id === selectedGist)?.filename || '';

		if (!gistId || !filename) {
			toast.error('Please select a gist and specify a filename');
			return;
		}

		isLoading = true;
		try {
			const api = new GitHubGistAPI(githubToken);
			const data = await api.fetchGist(gistId);
			gistInfo = data;

			if (!data.files[filename]) {
				throw new Error(`File "${filename}" not found in gist`);
			}

			const content = data.files[filename].content;
			
			// Validate and format JSON
			const validation = GitHubGistAPI.validateJSON(content);
			if (validation.valid && validation.formatted) {
				gistData = validation.formatted;
			} else {
				// If it's not valid JSON, just use the raw content
				gistData = content;
				if (!validation.valid) {
					toast.warning(`Content is not valid JSON: ${validation.error}`);
				}
			}

			toast.success('Gist loaded successfully');
		} catch (error) {
			console.error('Error loading gist:', error);
			toast.error(`Failed to load gist: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isLoading = false;
		}
	}

	async function saveGist() {
		if (!githubToken || !gistInfo) {
			toast.error('Please load a gist first');
			return;
		}

		// Validate JSON before saving
		const validation = jsonEditor?.validateJson();
		if (!validation?.valid) {
			toast.error(`Invalid JSON: ${validation?.error || 'Unknown error'}`);
			return;
		}

		const gistId = selectedGist === '' ? customGistId : selectedGist;
		const filename = selectedGist === '' ? customFilename : 
			knownGists.find(g => g.id === selectedGist)?.filename || '';

		isSaving = true;
		try {
			const currentValue = jsonEditor?.getValue() || '';
			
			const api = new GitHubGistAPI(githubToken);
			const updatedData = await api.updateGist(gistId, {
				files: {
					[filename]: {
						content: currentValue
					}
				}
			});

			gistInfo = updatedData;
			
			toast.success('Gist saved successfully!');
		} catch (error) {
			console.error('Error saving gist:', error);
			toast.error(`Failed to save gist: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isSaving = false;
		}
	}

	function formatJson() {
		jsonEditor?.formatJson();
		toast.success('JSON formatted');
	}

	function resetEditor() {
		if (gistInfo) {
			const filename = selectedGist === '' ? customFilename : 
				knownGists.find(g => g.id === selectedGist)?.filename || '';
			const originalContent = gistInfo.files[filename]?.content || '{}';
			gistData = originalContent;
			toast.success('Editor reset to original content');
		}
	}
</script>

<svelte:head>
	<title>muenstererOS - Admin</title>
</svelte:head>

<div class="container mx-auto max-w-6xl space-y-6">
	<div class="flex items-center justify-between">
		<div>
            <Heading>Gist Admin</Heading>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="text-xs">
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
	</div>

	<!-- Gist Selection Section -->
	<Card>
		<CardHeader>
			<CardTitle class="text-lg">Select Gist</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="space-y-2">
					<Label>Gist</Label>
					<select 
						bind:value={selectedGist}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#each knownGists as gist}
							<option value={gist.id}>{gist.name}</option>
						{/each}
					</select>
				</div>

				{#if selectedGist === ''}
					<div class="space-y-2">
						<Label for="customGistId">Custom Gist ID</Label>
						<Input
							id="customGistId"
							placeholder="f18bfa6e4f02dc480426d05cf7adff79"
							bind:value={customGistId}
						/>
					</div>
					<div class="space-y-2">
						<Label for="customFilename">Filename</Label>
						<Input
							id="customFilename"
							placeholder="data.json"
							bind:value={customFilename}
						/>
					</div>
				{:else}
					<div class="space-y-2">
						<Label>Filename</Label>
						<Input 
							value={knownGists.find(g => g.id === selectedGist)?.filename || ''} 
							disabled 
						/>
					</div>
					<div class="space-y-2">
						<Label>Gist ID</Label>
						<Input value={selectedGist} disabled />
					</div>
				{/if}
			</div>

			<Button onclick={loadGist} disabled={isLoading || !githubToken} class="w-full">
				{isLoading ? 'Loading...' : 'Load Gist'}
			</Button>
		</CardContent>
	</Card>

	<!-- Gist Info Display -->
	{#if gistInfo}
		<Card>
			<CardHeader>
				<CardTitle class="text-lg">Gist Information</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
					<div>
						<Label class="text-xs uppercase text-muted-foreground">Description</Label>
						<p>{gistInfo.description || 'No description'}</p>
					</div>
					<div>
						<Label class="text-xs uppercase text-muted-foreground">Last Updated</Label>
						<p>{new Date(gistInfo.updated_at).toLocaleString()}</p>
					</div>
					<div>
						<Label class="text-xs uppercase text-muted-foreground">Public</Label>
						<p>{gistInfo.public ? 'Yes' : 'No'}</p>
					</div>
				</div>
				<div class="mt-4">
					<a 
						href={gistInfo.html_url} 
						target="_blank" 
						class="text-sm text-blue-600 hover:underline"
					>
						View on GitHub ↗
					</a>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- JSON Editor Section -->
	{#if gistData !== '{}'}
		<Card>
			<CardHeader>
				<CardTitle class="text-lg flex items-center justify-between">
					JSON Editor
					<div class="flex gap-2">
						<Button onclick={formatJson} variant="outline" size="sm">
							Format
						</Button>
						<Button onclick={resetEditor} variant="outline" size="sm">
							Reset
						</Button>
						<Button 
							onclick={saveGist} 
							disabled={isSaving || !githubToken || !gistInfo}
							size="sm"
						>
							{isSaving ? 'Saving...' : 'Save Gist'}
						</Button>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<JsonEditor 
					bind:this={jsonEditor}
					bind:value={gistData}
					height="500px"
					options={{
						tabSize: 2,
						insertSpaces: true,
						detectIndentation: false
					}}
				/>
			</CardContent>
		</Card>
	{/if}
</div>
