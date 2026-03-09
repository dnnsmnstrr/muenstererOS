<script lang="ts">
	import JsonEditor from '$lib/components/JsonEditor.svelte';
	import { Button } from '$lib/components/ui/button';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import { Save, Code, FormInput } from 'lucide-svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { GistData } from '$lib/utils/github-api';
	import DynamicForm from './DynamicForm.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { mode } from 'mode-watcher';
	import { get } from 'svelte/store';

	let {
		githubToken = $bindable(''),
		gistData = $bindable('{}'),
		gistInfo = $bindable<GistData>(),
		schema = null,
        isSaving = false,
        onFormatJson,
        onResetEditor,
        onSaveGist,
	} = $props();
    
	let jsonEditorRef = $state<JsonEditor | null>(null);
	let viewMode = $state<'editor' | 'form'>('editor');
	let formData = $state<any>(null);
	let lastSyncedGistData = $state('');

	$effect(() => {
		// Sync from editor to form only when gistData changes from outside (Load/Reset)
		if (viewMode === 'form' && gistData !== lastSyncedGistData) {
			try {
				formData = JSON.parse(gistData);
				lastSyncedGistData = gistData;
			} catch (e) {
				console.error('Failed to parse gistData for form view', e);
			}
		}
	});

	function handleViewChange(value: string | undefined) {
		if (!value) return;

		if (viewMode === 'form' && value === 'editor') {
			// Sync form data back to editor
			const newGistData = JSON.stringify(formData, null, 2);
			gistData = newGistData;
			lastSyncedGistData = newGistData;
		} else if (viewMode === 'editor' && value === 'form') {
			// Sync editor data to form
			try {
				formData = JSON.parse(gistData);
				lastSyncedGistData = gistData;
			} catch (e) {
				console.error('Invalid JSON in editor, cannot switch to form', e);
				return;
			}
		}
		viewMode = value as 'editor' | 'form';
	}

	function handleReset() {
		onResetEditor();
		if (viewMode === 'form') {
			try {
				formData = JSON.parse(gistData);
				lastSyncedGistData = gistData;
			} catch (e) {
				console.error('Failed to parse gistData for form view after reset', e);
			}
		}
	}
	
	// Re-export methods from JsonEditor
	export function setValue(value: string) {
		if (viewMode === 'form') {
			try {
				formData = JSON.parse(value);
				gistData = value;
				lastSyncedGistData = value;
			} catch (e) {
				console.error('Failed to set value in form mode', e);
			}
		} else {
			jsonEditorRef?.setValue(value);
		}
	}
	
	export function getValue() {
		if (viewMode === 'form') {
			return JSON.stringify(formData, null, 2);
		}
		return jsonEditorRef?.getValue() || gistData;
	}
	
	export function validateJson() {
		if (viewMode === 'form') {
			// Form data is inherently valid JSON when stringified
			return { valid: true };
		}
		return jsonEditorRef?.validateJson() || { valid: true };
	}
	
	export function formatJson() {
		if (viewMode === 'form') {
			// Already "formatted" by stringify in getValue
			return true;
		}
		return jsonEditorRef?.formatJson();
	}
	
	export function setTheme(themeName: string) {
		jsonEditorRef?.setTheme(themeName);
	}

	const availableThemes = [
		{ value: 'json-dark', label: 'JSON Dark' },
		{ value: 'json-light', label: 'JSON Light' },
		{ value: 'vs-dark', label: 'VS Dark' },
		{ value: 'vs', label: 'VS Light' }
	];

	let selectedTheme = $state(get(mode) === 'dark' ? 'json-dark' : 'json-light');
	function handleThemeChange(value: string) {
		selectedTheme = value;
		jsonEditorRef?.setTheme(value);
	}
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex flex-col items-center justify-between gap-2 text-lg sm:flex-row">
			<div class="flex w-full items-center justify-between gap-4 sm:w-auto">
				<span class="font-semibold">Editor</span>
				{#if schema}
					<Tabs.Root value={viewMode} onValueChange={handleViewChange} class="w-auto">
						<Tabs.List>
							<Tabs.Trigger value="editor" class="flex items-center gap-1.5">
								<Code class="h-4 w-4" />
								Editor
							</Tabs.Trigger>
							<Tabs.Trigger value="form" class="flex items-center gap-1.5">
								<FormInput class="h-4 w-4" />
								Form
							</Tabs.Trigger>
						</Tabs.List>
					</Tabs.Root>
				{/if}
				{#if viewMode === 'editor'}
					<CustomSelect
						class="w-[130px]"
						value={selectedTheme}
						name="theme"
						placeholder="Select theme"
						options={availableThemes}
						onValueChange={handleThemeChange}
					/>
				{/if}
			</div>
			<div class="flex w-full justify-between gap-2 sm:w-auto">
				<div class="flex items-center gap-2">
					{#if viewMode === 'editor'}
						<Button onclick={onFormatJson} variant="outline">Format</Button>
					{/if}
					<Button onclick={handleReset} variant="outline">Reset</Button>
				</div>
				<Button
					onclick={() => {
						if (viewMode === 'form') {
							gistData = JSON.stringify(formData, null, 2);
						}
						onSaveGist();
					}}
					disabled={isSaving || !githubToken || !gistInfo}
					size="sm"
				>
					<Save class="h-4 w-4" />
					{isSaving ? 'Saving...' : 'Save Gist'}
				</Button>
			</div>
		</CardTitle>
	</CardHeader>
	<CardContent>
		{#if viewMode === 'editor'}
			<JsonEditor
				bind:this={jsonEditorRef}
				bind:value={gistData}
				height="70vh"
				options={{
					tabSize: 2,
					insertSpaces: true,
					detectIndentation: false
				}}
			/>
		{:else if viewMode === 'form' && schema}
			<div class="max-h-[70vh] overflow-y-auto pr-2">
				<DynamicForm {schema} bind:data={formData} />
			</div>
		{/if}
	</CardContent>
</Card>
