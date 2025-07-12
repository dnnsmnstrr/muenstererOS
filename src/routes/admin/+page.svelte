<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import JsonEditor from '$lib/components/JsonEditor.svelte';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import AdminSettings from './AdminSettings.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronDown, Save } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { gists  } from '$lib/config';
	import { GitHubGistAPI } from '$lib/utils/github-api';
	import { Heading } from '$lib/components/typography';

	// State management
	let githubToken = $state('');
	let selectedGist = $state(gists.now.id);
	let gistData = $state('{}');
	let gistInfo = $state<any>(null);
	let gistHistory = $state<any[]>([]);
	let isLoading = $state(false);
	let isSaving = $state(false);
	let isValidatingToken = $state(false);
	let tokenValidation = $state<{ valid: boolean; scopes?: string[]; error?: string } | null>(null);
	let gistSelectionOpen = $state(true);
	let gistInfoOpen = $state(false);
	let jsonViewerOpen = $state(false);

	let jsonEditor = $state<JsonEditor | null>(null);

	// Predefined gists
	const knownGists = [
		...Object.values(gists),
		{ id: '', name: 'Custom Gist...', filename: '' }
	];

	// Custom gist fields for when user selects "Custom Gist..."
	let customGistId = $state('');
	let customFilename = $state('');
	let selectedTheme = $state('json-dark');

	// Available themes for the JSON editor
	const availableThemes = [
		{ value: 'json-dark', label: 'JSON Dark' },
		{ value: 'json-light', label: 'JSON Light' },
		{ value: 'vs-dark', label: 'VS Dark' },
		{ value: 'vs', label: 'VS Light' },
	];

	onMount(() => {
		// Load saved token and last gist selection from localStorage
		if (browser) {
			const savedToken = localStorage.getItem('github_admin_token');
			const savedGistId = localStorage.getItem('github_admin_last_gist');

			// Restore last gist selection if available
			if (savedGistId) {
				selectedGist = savedGistId;
			}

			if (savedToken) {
				githubToken = savedToken;
				validateToken(); // Validate the loaded token
				// Auto-load the selected gist if token is available
				loadGist();
			}
		}
	});

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

	async function loadGist() {
		if (!githubToken) {
			toast.error('Please enter a GitHub token first');
			return;
		}

		const gistId = selectedGist === '' ? customGistId : selectedGist;
		const filename =
			selectedGist === ''
				? customFilename
				: knownGists.find((g) => g.id === selectedGist)?.filename || '';

		if (!gistId || !filename) {
			toast.error('Please select a gist and specify a filename');
			return;
		}

		// Save the current gist selection to localStorage
		if (browser) {
			localStorage.setItem('github_admin_last_gist', selectedGist);
		}

		// Clear current content to show loading state
		gistData = '{}';

		isLoading = true;
		try {
			const api = new GitHubGistAPI(githubToken);
			const data = await api.fetchGist(gistId);
			gistInfo = data;

			// Use history from the gist response if available
			gistHistory = data.history || [];
			if (gistHistory && gistHistory.length === 30) {
				const fullHistory = await api.fetchGistHistory(gistId);
				gistHistory = fullHistory || gistHistory;
			}
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

			jsonEditor?.setValue(gistData);
			toast.success('Gist loaded successfully');
		} catch (error) {
			console.error('Error loading gist:', error);
			toast.error(
				`Failed to load gist: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
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
		const filename =
			selectedGist === ''
				? customFilename
				: knownGists.find((g) => g.id === selectedGist)?.filename || '';

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
			toast.error(
				`Failed to save gist: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		} finally {
			isSaving = false;
		}
	}

	function formatJson() {
		const success = jsonEditor?.formatJson();
		if (success) {
			toast.success('JSON formatted');
		} else {
			toast.error('Failed to format JSON - invalid syntax');
		}
	}

	function resetEditor() {
		if (gistInfo) {
			const filename =
				selectedGist === ''
					? customFilename
					: knownGists.find((g) => g.id === selectedGist)?.filename || '';
			const originalContent = gistInfo.files[filename]?.content || '{}';

			// Use setValue to properly update the editor
			jsonEditor?.setValue(originalContent);
			toast.success('Editor reset to original content');
		}
	}

	function onThemeChange(value: string) {
		selectedTheme = value;
		jsonEditor?.setTheme(value);
	}
</script>

<svelte:head>
	<title>muenstererOS - Admin</title>
</svelte:head>

<div class="container mx-auto max-w-6xl space-y-6">
	<div class="flex items-center justify-between">
		<Heading class="mb-0">Gist Admin</Heading>
		<AdminSettings bind:githubToken bind:tokenValidation bind:isValidatingToken />
	</div>

	<!-- Gist Selection Section -->
	<Card>
		<Collapsible.Root bind:open={gistSelectionOpen}>
			<CardHeader class="p-0">
				<Collapsible.Trigger class="p-0">
					<Button
						variant="ghost"
						class="w-full justify-between p-6 font-semibold hover:bg-transparent"
					>
						Select Gist
						<ChevronDown
							class="h-4 w-4 transition-transform duration-200 {gistSelectionOpen
								? 'rotate-180'
								: ''}"
						/>
					</Button>
				</Collapsible.Trigger>
			</CardHeader>
			<Collapsible.Content>
				<CardContent class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
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
								<Input id="customFilename" placeholder="data.json" bind:value={customFilename} />
							</div>
						{:else}
							<div class="space-y-2">
								<Label>Filename</Label>
								<Input
									value={knownGists.find((g) => g.id === selectedGist)?.filename || ''}
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
			</Collapsible.Content>
		</Collapsible.Root>
	</Card>

	<!-- Gist Info Display -->
	{#if gistInfo}
		<Card>
			<Collapsible.Root bind:open={gistInfoOpen}>
				<CardHeader class="p-0">
					<Collapsible.Trigger class="p-0">
						<Button
							variant="ghost"
							class="w-full justify-between p-6 font-semibold hover:bg-transparent"
						>
							Gist Information
							<ChevronDown
								class="h-4 w-4 transition-transform duration-200 {gistInfoOpen ? 'rotate-180' : ''}"
							/>
						</Button>
					</Collapsible.Trigger>
				</CardHeader>
				<Collapsible.Content>
					<CardContent>
						<div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
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
							<div>
								<Label class="text-xs uppercase text-muted-foreground">Versions</Label>
								<p>{gistHistory.length > 0 ? gistHistory.length : 'N/A'}</p>
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
				</Collapsible.Content>
			</Collapsible.Root>
		</Card>
	{/if}

	<!-- JSON Editor Section -->
	{#if gistData !== '{}'}
		<Card>
			<CardHeader>
				<CardTitle class="flex flex-col items-center justify-between gap-2 text-lg sm:flex-row">
					<div class="flex w-full items-center justify-between gap-2 sm:w-auto">
						<span class="font-semibold">Editor</span>
						<CustomSelect
							class="w-[130px]"
							value={selectedTheme}
							name="theme"
							placeholder="Select theme"
							options={availableThemes}
							onValueChange={onThemeChange}
						/>
					</div>
					<div class="flex w-full justify-between gap-2 sm:w-auto">
						<div class="flex items-center gap-2">
							<Button onclick={formatJson} variant="outline">Format</Button>
							<Button onclick={resetEditor} variant="outline">Reset</Button>
						</div>
						<Button onclick={saveGist} disabled={isSaving || !githubToken || !gistInfo} size="sm">
							<Save class="h-4 w-4" />
							{isSaving ? 'Saving...' : 'Save Gist'}
						</Button>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<JsonEditor
					bind:this={jsonEditor}
					bind:value={gistData}
					height="70vh"
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
