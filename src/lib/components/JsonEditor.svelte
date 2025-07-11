<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { mode } from 'mode-watcher';
	import type * as Monaco from 'monaco-editor';
	
	let { 
		value = $bindable('{}'),
		language = 'json',
		theme = $mode === 'dark' ? 'vs-dark' : 'vs',
		options = {},
		height = '400px',
		readonly = false
	} = $props();

	let container: HTMLDivElement;
	let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
	let monaco: typeof Monaco | null = null;

	const defaultOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
		automaticLayout: true,
		fontSize: 14,
		lineNumbers: 'on',
		roundedSelection: false,
		scrollBeyondLastLine: false,
		minimap: { enabled: false },
		readOnly: readonly,
		wordWrap: 'on',
		formatOnPaste: true,
		formatOnType: true,
		...options
	};

	onMount(async () => {
		if (!browser) return;

		try {
			// Dynamically import Monaco to avoid SSR issues
			monaco = await import('monaco-editor');
			
			// Configure JSON validation and formatting
			monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
				validate: true,
				allowComments: false,
				schemas: [],
				enableSchemaRequest: true
			});

			// Create the editor
			editor = monaco.editor.create(container, {
				value,
				language,
				theme,
				...defaultOptions
			});

			// Listen for value changes
			editor.onDidChangeModelContent(() => {
				value = editor?.getValue() || '';
			});

			// Format JSON on initial load
			if (language === 'json') {
				formatJson();
			}

		} catch (error) {
			console.error('Failed to load Monaco Editor:', error);
		}

		return () => {
			editor?.dispose();
		};
	});

	export function formatJson() {
		if (!editor || !monaco) return;
		
		try {
			const currentValue = editor.getValue();
			const parsed = JSON.parse(currentValue);
			const formatted = JSON.stringify(parsed, null, 2);
			
			editor.setValue(formatted);
		} catch (error) {
			console.warn('Invalid JSON - cannot format:', error);
		}
	}

	export function validateJson(): { valid: boolean; error?: string } {
		if (!editor) return { valid: false, error: 'Editor not initialized' };
		
		try {
			JSON.parse(editor.getValue());
			return { valid: true };
		} catch (error) {
			return { 
				valid: false, 
				error: error instanceof Error ? error.message : 'Invalid JSON' 
			};
		}
	}

	export function getValue() {
		return editor?.getValue() || '';
	}

	export function setValue(newValue: string) {
		if (editor) {
			editor.setValue(newValue);
		}
	}

	// Update editor when external value changes
	$effect(() => {
		if (editor && editor.getValue() !== value) {
			editor.setValue(value);
		}
	});

	// Update theme when mode changes
	$effect(() => {
		if (editor && monaco) {
			const newTheme = $mode === 'dark' ? 'vs-dark' : 'vs';
			monaco.editor.setTheme(newTheme);
		}
	});
</script>

<div 
	bind:this={container} 
	class="border border-border rounded-md overflow-hidden bg-background"
	style="height: {height}; width: 100%;"
></div>

<style>
	/* Ensure Monaco Editor styles are properly scoped */
	:global(.monaco-editor) {
		font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace !important;
	}
	
	:global(.monaco-editor .margin) {
		background: transparent !important;
	}
</style>
