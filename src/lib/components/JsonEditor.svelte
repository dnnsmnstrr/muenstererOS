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
	let isEditorReady = $state(false);

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

			// Define custom color themes for better JSON syntax highlighting
			monaco.editor.defineTheme('json-dark', {
				base: 'vs-dark',
				inherit: true,
				rules: [
					{ token: 'string.key.json', foreground: '9CDCFE', fontStyle: 'bold' },
					{ token: 'string.value.json', foreground: 'CE9178' },
					{ token: 'number.json', foreground: 'B5CEA8', fontStyle: 'bold' },
					{ token: 'keyword.json', foreground: '569CD6', fontStyle: 'bold' },
					{ token: 'delimiter.bracket.json', foreground: 'FFD700', fontStyle: 'bold' },
					{ token: 'delimiter.array.json', foreground: 'FFD700', fontStyle: 'bold' }
				],
				colors: {
					'editorBracketMatch.background': '#FFD70080',
					'editorBracketMatch.border': '#FFD700'
				}
			});

			monaco.editor.defineTheme('json-light', {
				base: 'vs',
				inherit: true,
				rules: [
					{ token: 'string.key.json', foreground: '0451A5', fontStyle: 'bold' },
					{ token: 'string.value.json', foreground: 'A31515' },
					{ token: 'number.json', foreground: '098658', fontStyle: 'bold' },
					{ token: 'keyword.json', foreground: '0000FF', fontStyle: 'bold' },
					{ token: 'delimiter.bracket.json', foreground: 'FF8C00', fontStyle: 'bold' },
					{ token: 'delimiter.array.json', foreground: 'FF8C00', fontStyle: 'bold' }
				],
				colors: {
					'editorBracketMatch.background': '#FFD70080',
					'editorBracketMatch.border': '#FF8C00'
				}
			});

			// Create the editor
			const currentTheme = $mode === 'dark' ? 'json-dark' : 'json-light';
			editor = monaco.editor.create(container, {
				value,
				language,
				theme: currentTheme,
				...defaultOptions,
				// Essential JSON features
				bracketPairColorization: { enabled: true },
				matchBrackets: 'always',
				foldingHighlight: true,
				showFoldingControls: 'mouseover'
			});

			// Listen for value changes
			editor.onDidChangeModelContent(() => {
				value = editor?.getValue() || '';
			});

			// Format JSON on initial load
			if (language === 'json') {
				formatJson();
			}

			isEditorReady = true;

		} catch (error) {
			console.error('Failed to load Monaco Editor:', error);
		}
	});

	// Cleanup on destroy
	$effect(() => {
		return () => {
			editor?.dispose();
		};
	});

	export function formatJson() {
		if (!editor || !monaco) return false;
		
		try {
			const currentValue = editor.getValue();
			const parsed = JSON.parse(currentValue);
			const formatted = JSON.stringify(parsed, null, 2);
			
			editor.setValue(formatted);
			value = formatted; // Update the bound value
			return true;
		} catch (error) {
			console.warn('Invalid JSON - cannot format:', error);
			return false;
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
			value = newValue; // Update the bound value
		}
	}

	export function refresh() {
		if (editor && isEditorReady && value !== undefined) {
			editor.setValue(value);
		}
	}

	export function focus() {
		editor?.focus();
	}

	// Update editor when external value changes
	$effect(() => {
		if (editor && isEditorReady && value !== undefined && value !== null) {
			const currentEditorValue = editor.getValue();
			if (currentEditorValue !== value) {
				// Preserve cursor position when updating
				const position = editor.getPosition();
				editor.setValue(value);
				if (position) {
					// Only restore position if it's valid for the new content
					const model = editor.getModel();
					if (model && position.lineNumber <= model.getLineCount()) {
						editor.setPosition(position);
					}
				}
			}
		}
	});

	// Update theme when mode changes
	$effect(() => {
		if (editor && monaco) {
			const newTheme = $mode === 'dark' ? 'json-dark' : 'json-light';
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
	/* Monaco Editor styles */
	:global(.monaco-editor) {
		font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'SF Mono', monospace !important;
	}
	
	:global(.monaco-editor .margin) {
		background: transparent !important;
	}
	
	/* JSON syntax highlighting enhancements */
	:global(.monaco-editor .bracket-highlighting-0),
	:global(.monaco-editor .bracket-highlighting-1),
	:global(.monaco-editor .bracket-highlighting-2),
	:global(.monaco-editor .bracket-highlighting-3),
	:global(.monaco-editor .bracket-highlighting-4),
	:global(.monaco-editor .bracket-highlighting-5) {
		font-weight: bold;
	}
	
	/* Improved bracket matching */
	:global(.monaco-editor .bracket-match) {
		background: rgba(255, 215, 0, 0.3) !important;
		border: 1px solid rgba(255, 215, 0, 0.8);
		border-radius: 2px;
	}
</style>
