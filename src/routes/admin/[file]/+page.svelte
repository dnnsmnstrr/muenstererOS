<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import JsonEditor from '$lib/components/JsonEditor.svelte';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import AdminSettings from '../AdminSettings.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Save } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { gists  } from '$lib/config';
	import { GitHubGistAPI, type GistData } from '$lib/utils/github-api';
	import { Heading } from '$lib/components/typography';
	import type { PageProps } from './$types';
	import GistInfo from '../GistInfo.svelte';
	import GistEditor from '../GistEditor.svelte';
	import { capitalize } from '$lib/utils/helper';

	let { data }: PageProps = $props();

	// State management
	let githubToken = $state('');
	let selectedGist = $state(gists[data.file || 'now'].id);
	let gistData = $state('{}');
	let gistInfo = $state<GistData>();
	let fullGistHistory = $state<any[]>([]);
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
			// if (savedGistId) {
			// 	selectedGist = savedGistId;
			// }

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
			fullGistHistory = data.history || [];
			if (fullGistHistory && fullGistHistory.length === 30) {
				const fullHistory = await api.fetchGistHistory(gistId);
				fullGistHistory = fullHistory || fullGistHistory;
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
</script>

<svelte:head>
	<title>muenstererOS - Admin</title>
</svelte:head>

<div class="container mx-auto max-w-6xl space-y-6">
	<div class="flex items-center justify-between">
		<Heading class="mb-0">{capitalize(data.file || 'Gist')} Admin</Heading>
		<AdminSettings bind:githubToken bind:tokenValidation bind:isValidatingToken />
	</div>


	{#if gistInfo}
		<GistInfo {gistInfo} history={fullGistHistory} bind:isOpen={gistInfoOpen} />
	{/if}

	{#if gistData !== '{}'}
		<GistEditor
			bind:gistData
			bind:githubToken
			bind:gistInfo
			onFormatJson={formatJson}
			onResetEditor={resetEditor}
			onSaveGist={saveGist}
			{isSaving}
		/>
	{/if}
</div>
