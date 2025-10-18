<script lang="ts">
	import JsonEditor from '$lib/components/JsonEditor.svelte';
	import { Button } from '$lib/components/ui/button';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import { Save } from 'lucide-svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { GistData } from '$lib/utils/github-api';

    let {
		githubToken = $bindable(''),
		gistData = $bindable('{}'),
		gistInfo = $bindable<GistData>(),
        isSaving = false,
        onFormatJson,
        onResetEditor,
        onSaveGist,
	} = $props();
    
	let jsonEditor = $state<JsonEditor | null>(null);

	const availableThemes = [
		{ value: 'json-dark', label: 'JSON Dark' },
		{ value: 'json-light', label: 'JSON Light' },
		{ value: 'vs-dark', label: 'VS Dark' },
		{ value: 'vs', label: 'VS Light' }
	];

	let selectedTheme = $state('json-dark');
	function handleThemeChange(value: string) {
		selectedTheme = value;
		jsonEditor?.setTheme(value);
	}
</script>

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
					onValueChange={handleThemeChange}
				/>
			</div>
			<div class="flex w-full justify-between gap-2 sm:w-auto">
				<div class="flex items-center gap-2">
					<Button onclick={onFormatJson} variant="outline">Format</Button>
					<Button onclick={onResetEditor} variant="outline">Reset</Button>
				</div>
				<Button onclick={onSaveGist} disabled={isSaving || !githubToken || !gistInfo} size="sm">
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
