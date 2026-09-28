<script lang="ts">
	import JsonEditor from '$lib/components/JsonEditor.svelte';
	import { Button } from '$lib/components/ui/button';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import { Save, Code, FormInput, Sparkles } from 'lucide-svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { GistData } from '$lib/utils/github-api';
	import DynamicForm from './DynamicForm.svelte';
	import NowEditor from './NowEditor.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { mode } from 'mode-watcher';
	import { get } from 'svelte/store';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { gists } from '$lib/config';

	let {
		githubToken = $bindable(''),
		gistData = $bindable('{}'),
		gistInfo = $bindable<GistData>(),
		selectedGist = '',
		schema = null,
		isSaving = false,
		onFormatJson,
		onResetEditor,
		onSaveGist
	} = $props();

	let jsonEditorRef = $state<JsonEditor | null>(null);

	let isNowGist = $derived(
		selectedGist === gists.now.id ||
		(gistInfo?.files && 'now.json' in gistInfo.files) ||
		page.url.searchParams.get('file') === 'now'
	);

	let viewMode = $derived(
		(page.url.searchParams.get('mode') as 'editor' | 'form' | 'now') ||
		(isNowGist ? 'now' : schema ? 'form' : 'editor')
	);

	let formData = $state<any>(null);
	let lastSyncedGistData = $state('');
	let lastViewMode = $state<'editor' | 'form' | 'now'>('editor');

	$effect(() => {
		if ((lastViewMode === 'form' || lastViewMode === 'now') && viewMode === 'editor') {
			// Sync form data back to editor
			let dataToSync = formData;
			const schemaType = schema?.type || (schema?.properties ? 'object' : schema?.items ? 'array' : 'string');
			if (schemaType === 'array' && formData && typeof formData === 'object' && 'root' in formData) {
				dataToSync = formData.root;
			}

			const newGistData = JSON.stringify(dataToSync, null, 2);
			if (newGistData !== gistData) {
				gistData = newGistData;
				lastSyncedGistData = newGistData;
			}
		}
		lastViewMode = viewMode;
	});

	$effect(() => {
		if (!page.url.searchParams.has('mode')) {
			if (isNowGist) {
				const url = new URL(page.url);
				url.searchParams.set('mode', 'now');
				goto(url, { replaceState: true, noScroll: true, keepFocus: true });
			} else if (schema) {
				const url = new URL(page.url);
				url.searchParams.set('mode', 'form');
				goto(url, { replaceState: true, noScroll: true, keepFocus: true });
			}
		} else if (!schema && !isNowGist && viewMode !== 'editor') {
			const url = new URL(page.url);
			url.searchParams.set('mode', 'editor');
			goto(url, { replaceState: true, noScroll: true, keepFocus: true });
		}
	});

	$effect(() => {
		// Sync from editor to form/now when gistData changes from outside
		if ((viewMode === 'form' || viewMode === 'now') && gistData !== lastSyncedGistData) {
			try {
				formData = JSON.parse(gistData);
				lastSyncedGistData = gistData;
			} catch (e) {
				console.error('Failed to parse gistData for form/now view', e);
			}
		}
	});

	function handleViewChange(value: string | undefined) {
		if (!value || value === viewMode) return;

		const url = new URL(page.url);
		url.searchParams.set('mode', value);
		goto(url, { replaceState: false, noScroll: true, keepFocus: true });
	}

	function handleReset() {
		onResetEditor();
		if (viewMode === 'form' || viewMode === 'now') {
			try {
				formData = JSON.parse(gistData);
				lastSyncedGistData = gistData;
			} catch (e) {
				console.error('Failed to parse gistData for form/now view after reset', e);
			}
		}
	}

	// Re-export methods for JsonEditor API compatibility
	export function setValue(value: string) {
		if (viewMode === 'form' || viewMode === 'now') {
			try {
				formData = JSON.parse(value);
				gistData = value;
				lastSyncedGistData = value;
			} catch (e) {
				console.error('Failed to set value in form/now mode', e);
			}
		} else {
			jsonEditorRef?.setValue(value);
		}
	}

	export function getValue() {
		if (viewMode === 'form' || viewMode === 'now') {
			let dataToSync = formData;
			const schemaType = schema?.type || (schema?.properties ? 'object' : schema?.items ? 'array' : 'string');
			if (schemaType === 'array' && formData && typeof formData === 'object' && 'root' in formData) {
				dataToSync = formData.root;
			}
			return JSON.stringify(dataToSync, null, 2);
		}
		return jsonEditorRef?.getValue() || gistData;
	}

	export function validateJson() {
		if (viewMode === 'form' || viewMode === 'now') {
			return { valid: true };
		}
		return jsonEditorRef?.validateJson() || { valid: true };
	}

	export function formatJson() {
		if (viewMode === 'form' || viewMode === 'now') {
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
				{#if schema || isNowGist}
					<Tabs.Root value={viewMode} onValueChange={handleViewChange} class="w-auto">
						<Tabs.List>
							{#if isNowGist}
								<Tabs.Trigger value="now" class="flex items-center gap-1.5 font-semibold">
									<Sparkles class="h-4 w-4 text-primary" />
									Now Editor
								</Tabs.Trigger>
							{/if}
							{#if schema}
								<Tabs.Trigger value="form" class="flex items-center gap-1.5">
									<FormInput class="h-4 w-4" />
									{i18n.t('admin.editor.form_tab')}
								</Tabs.Trigger>
							{/if}
							<Tabs.Trigger value="editor" class="flex items-center gap-1.5">
								<Code class="h-4 w-4" />
								{i18n.t('admin.editor.editor_tab')}
							</Tabs.Trigger>
						</Tabs.List>
					</Tabs.Root>
				{/if}
				{#if viewMode === 'editor'}
					<CustomSelect
						class="hidden w-[130px] lg:flex"
						value={selectedTheme}
						name="theme"
						placeholder={i18n.t('admin.editor.select_theme')}
						options={availableThemes}
						onValueChange={handleThemeChange}
					/>
				{/if}
			</div>
			<div class="flex w-full justify-between gap-2 sm:w-auto">
				<div class="flex items-center gap-2">
					{#if viewMode === 'editor'}
						<Button onclick={onFormatJson} variant="outline">{i18n.t('admin.editor.format')}</Button>
					{/if}
					<Button onclick={handleReset} variant="outline">{i18n.t('admin.editor.reset')}</Button>
				</div>
				<Button
					onclick={() => {
						if (viewMode === 'form' || viewMode === 'now') {
							let dataToSync = formData;
							const schemaType = schema?.type || (schema?.properties ? 'object' : schema?.items ? 'array' : 'string');
							if (schemaType === 'array' && formData && typeof formData === 'object' && 'root' in formData) {
								dataToSync = formData.root;
							}
							gistData = JSON.stringify(dataToSync, null, 2);
						}
						onSaveGist();
					}}
					disabled={isSaving || !githubToken || !gistInfo}
					size="sm"
				>
					<Save class="h-4 w-4" />
					{isSaving ? i18n.t('admin.editor.saving') : i18n.t('admin.editor.save')}
				</Button>
			</div>
		</CardTitle>
	</CardHeader>
	<CardContent>
		{#if viewMode === 'now'}
			<NowEditor
				bind:formData
				{schema}
				{githubToken}
				gistId={gistInfo?.id || ''}
			/>
		{:else if viewMode === 'editor'}
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
