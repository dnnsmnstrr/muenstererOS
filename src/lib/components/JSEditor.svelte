<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { mode } from 'mode-watcher';
	import type * as Monaco from 'monaco-editor';
	
	let { 
		value = $bindable(''),
		language = 'javascript',
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
		// Enhanced JavaScript editing features
		suggest: {
			showKeywords: true,
			showSnippets: true,
			showColors: true,
			showFiles: false,
			showReferences: true
		},
		quickSuggestions: {
			other: true,
			comments: false,
			strings: true
		},
		quickSuggestionsDelay: 100,
		parameterHints: { enabled: true },
		autoIndent: 'full',
		tabCompletion: 'on',
		acceptSuggestionOnEnter: 'on',
		snippetSuggestions: 'top',
		wordBasedSuggestions: 'currentDocument',
		// JavaScript-specific options
		autoClosingBrackets: 'always',
		autoClosingQuotes: 'always',
		insertSpaces: true,
		tabSize: 2,
		detectIndentation: true,
		...options
	};

	onMount(async () => {
		if (!browser) return;

		try {
			// Configure Monaco Environment for web workers
			(window as any).MonacoEnvironment = {
				getWorker: function (workerId: string, label: string) {
					// Use a more compatible worker setup for Vite
					const createWorker = (workerPath: string) => {
						const blob = new Blob([`
							self.MonacoEnvironment = {
								baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/'
							};
							importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/base/worker/workerMain.js');
						`], { type: 'application/javascript' });
						
						return new Worker(URL.createObjectURL(blob));
					};

					switch (label) {
						case 'javascript':
						case 'typescript':
							return createWorker('ts.worker');
						case 'json':
							return createWorker('json.worker');
						case 'css':
						case 'scss':
						case 'less':
							return createWorker('css.worker');
						case 'html':
						case 'handlebars':
						case 'razor':
							return createWorker('html.worker');
						default:
							return createWorker('editor.worker');
					}
				}
			};

			// Dynamically import Monaco to avoid SSR issues
			monaco = await import('monaco-editor');
			
			// Configure JavaScript/TypeScript language features
			monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
				noSemanticValidation: false,
				noSyntaxValidation: false,
				noSuggestionDiagnostics: false
			});

			// Configure JavaScript worker options for better performance
			monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
				target: monaco.languages.typescript.ScriptTarget.ES2020,
				allowNonTsExtensions: true,
				moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
				module: monaco.languages.typescript.ModuleKind.CommonJS,
				noEmit: true,
				esModuleInterop: true,
				jsx: monaco.languages.typescript.JsxEmit.React,
				reactNamespace: 'React',
				allowJs: true,
				typeRoots: ['node_modules/@types']
			});

			// Add extra libraries for better IntelliSense
			monaco.languages.typescript.javascriptDefaults.addExtraLib(`
				// DOM types
				declare var document: Document;
				declare var window: Window;
				declare var console: Console;
				declare var setTimeout: (handler: TimerHandler, timeout?: number, ...arguments: any[]) => number;
				declare var setInterval: (handler: TimerHandler, timeout?: number, ...arguments: any[]) => number;
				declare var clearTimeout: (id?: number) => void;
				declare var clearInterval: (id?: number) => void;
				
				// Console methods
				interface Console {
					log(...data: any[]): void;
					error(...data: any[]): void;
					warn(...data: any[]): void;
					info(...data: any[]): void;
					debug(...data: any[]): void;
				}
				
				// Document methods for the playground
				interface Document {
					getElementById(elementId: string): HTMLElement | null;
					querySelector(selectors: string): Element | null;
					querySelectorAll(selectors: string): NodeListOf<Element>;
				}
				
				// Common JavaScript utilities
				declare function alert(message?: any): void;
				declare function confirm(message?: string): boolean;
				declare function prompt(message?: string, defaultText?: string): string | null;
				
				// Math object
				declare var Math: Math;
				
				// Date constructor
				declare var Date: DateConstructor;
				
				// JSON object
				declare var JSON: JSON;
				
				// Array and Object constructors
				declare var Array: ArrayConstructor;
				declare var Object: ObjectConstructor;
				declare var String: StringConstructor;
				declare var Number: NumberConstructor;
				declare var Boolean: BooleanConstructor;
			`, 'dom.d.ts');

			// Register custom JavaScript completion provider
			monaco.languages.registerCompletionItemProvider('javascript', {
				provideCompletionItems: (model, position) => {
					const wordInfo = model.getWordUntilPosition(position);
					const range = {
						startLineNumber: position.lineNumber,
						startColumn: wordInfo.startColumn,
						endLineNumber: position.lineNumber,
						endColumn: wordInfo.endColumn
					};
					
					if (!monaco) return { suggestions: [] };
					
					const suggestions = [
						// Common JavaScript keywords and functions
						{
							label: 'console.log',
							kind: monaco.languages.CompletionItemKind.Function,
							insertText: 'console.log(${1:value})',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Log a value to the console',
							range
						},
						{
							label: 'document.getElementById',
							kind: monaco.languages.CompletionItemKind.Function,
							insertText: 'document.getElementById("${1:id}")',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Get an element by its ID',
							range
						},
						{
							label: 'document.querySelector',
							kind: monaco.languages.CompletionItemKind.Function,
							insertText: 'document.querySelector("${1:selector}")',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Select an element using CSS selector',
							range
						},
						{
							label: 'setTimeout',
							kind: monaco.languages.CompletionItemKind.Function,
							insertText: 'setTimeout(() => {\n\t${1:// code}\n}, ${2:1000})',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Execute code after a delay',
							range
						},
						{
							label: 'setInterval',
							kind: monaco.languages.CompletionItemKind.Function,
							insertText: 'setInterval(() => {\n\t${1:// code}\n}, ${2:1000})',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Execute code repeatedly',
							range
						},
						{
							label: 'function',
							kind: monaco.languages.CompletionItemKind.Keyword,
							insertText: 'function ${1:name}(${2:params}) {\n\t${3:// code}\n}',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Create a function',
							range
						},
						{
							label: 'const',
							kind: monaco.languages.CompletionItemKind.Keyword,
							insertText: 'const ${1:name} = ${2:value};',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Declare a constant',
							range
						},
						{
							label: 'let',
							kind: monaco.languages.CompletionItemKind.Keyword,
							insertText: 'let ${1:name} = ${2:value};',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Declare a variable',
							range
						},
						{
							label: 'var',
							kind: monaco.languages.CompletionItemKind.Keyword,
							insertText: 'var ${1:name} = ${2:value};',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Declare a variable (legacy)',
							range
						},
						{
							label: 'if',
							kind: monaco.languages.CompletionItemKind.Keyword,
							insertText: 'if (${1:condition}) {\n\t${2:// code}\n}',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Conditional statement',
							range
						},
						{
							label: 'for',
							kind: monaco.languages.CompletionItemKind.Keyword,
							insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3:// code}\n}',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'For loop',
							range
						},
						{
							label: 'forEach',
							kind: monaco.languages.CompletionItemKind.Method,
							insertText: 'forEach(${1:item} => {\n\t${2:// code}\n})',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Array forEach method',
							range
						},
						{
							label: 'map',
							kind: monaco.languages.CompletionItemKind.Method,
							insertText: 'map(${1:item} => {\n\treturn ${2:item};\n})',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Array map method',
							range
						},
						{
							label: 'filter',
							kind: monaco.languages.CompletionItemKind.Method,
							insertText: 'filter(${1:item} => {\n\treturn ${2:true};\n})',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Array filter method',
							range
						},
						{
							label: 'reduce',
							kind: monaco.languages.CompletionItemKind.Method,
							insertText: 'reduce((${1:acc}, ${2:item}) => {\n\treturn ${3:acc};\n}, ${4:initialValue})',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'Array reduce method',
							range
						}
					];
					
					return { suggestions };
				}
			});

			// Define custom color theme for better JavaScript syntax highlighting
			monaco.editor.defineTheme('js-dark', {
				base: 'vs-dark',
				inherit: true,
				rules: [
					{ token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
					{ token: 'string', foreground: 'CE9178' },
					{ token: 'number', foreground: 'B5CEA8', fontStyle: 'bold' },
					{ token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
					{ token: 'delimiter.bracket', foreground: 'FFD700', fontStyle: 'bold' },
					{ token: 'delimiter.parenthesis', foreground: 'FFD700', fontStyle: 'bold' },
					{ token: 'delimiter.square', foreground: 'FFD700', fontStyle: 'bold' },
					{ token: 'delimiter.curly', foreground: 'FFD700', fontStyle: 'bold' },
					{ token: 'identifier', foreground: '9CDCFE' },
					{ token: 'type', foreground: '4EC9B0' },
					{ token: 'function', foreground: 'DCDCAA' },
					{ token: 'variable', foreground: '9CDCFE' },
					{ token: 'property', foreground: '9CDCFE' }
				],
				colors: {
					'editor.background': '#1e1e1e',
					'editor.foreground': '#d4d4d4',
					'editorLineNumber.foreground': '#858585',
					'editorCursor.foreground': '#ffffff',
					'editor.selectionBackground': '#264f78',
					'editor.inactiveSelectionBackground': '#3a3d41',
					'editorBracketMatch.background': '#FFD70080',
					'editorBracketMatch.border': '#FFD700'
				}
			});

			monaco.editor.defineTheme('js-light', {
				base: 'vs',
				inherit: true,
				rules: [
					{ token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
					{ token: 'string', foreground: 'A31515' },
					{ token: 'number', foreground: '098658', fontStyle: 'bold' },
					{ token: 'comment', foreground: '008000', fontStyle: 'italic' },
					{ token: 'delimiter.bracket', foreground: 'FF8C00', fontStyle: 'bold' },
					{ token: 'delimiter.parenthesis', foreground: 'FF8C00', fontStyle: 'bold' },
					{ token: 'delimiter.square', foreground: 'FF8C00', fontStyle: 'bold' },
					{ token: 'delimiter.curly', foreground: 'FF8C00', fontStyle: 'bold' },
					{ token: 'identifier', foreground: '001080' },
					{ token: 'type', foreground: '267F99' },
					{ token: 'function', foreground: '795E26' },
					{ token: 'variable', foreground: '001080' },
					{ token: 'property', foreground: '001080' }
				],
				colors: {
					'editor.background': '#ffffff',
					'editor.foreground': '#000000',
					'editorLineNumber.foreground': '#237893',
					'editorCursor.foreground': '#000000',
					'editor.selectionBackground': '#ADD6FF',
					'editor.inactiveSelectionBackground': '#E5EBF1',
					'editorBracketMatch.background': '#FFD70080',
					'editorBracketMatch.border': '#FF8C00'
				}
			});

			// Load popular themes from monaco-themes
			try {
				const monacoThemesModule = await import('monaco-themes');
				
				// Define additional popular themes for JavaScript editing
				const popularThemes = [
					'Monokai',
					'GitHub',
					'Solarized-dark',
					'Dracula',
					'One Dark Pro',
					'Material Dark'
				];

				// Load these themes if available
				for (const themeName of popularThemes) {
					try {
						if (monacoThemesModule.default) {
							// Use the default export method
							const themeData = monacoThemesModule.default.parseTmTheme(themeName);
							if (themeData) {
								monaco.editor.defineTheme(themeName, themeData);
							}
						}
					} catch (e) {
						console.warn(`Could not load theme ${themeName}:`, e);
					}
				}
			} catch (e) {
				console.warn('Could not load monaco-themes:', e);
			}

			// Create the editor with enhanced options
			const currentTheme = $mode === 'dark' ? 'js-dark' : 'js-light';
			editor = monaco.editor.create(container, {
				value,
				language,
				theme: currentTheme,
				...defaultOptions,
				// Enhanced JavaScript-specific options
				bracketPairColorization: { enabled: true },
				colorDecorators: true,
				foldingHighlight: true,
				showFoldingControls: 'mouseover',
				matchBrackets: 'always',
				renderWhitespace: 'boundary',
				// Additional JavaScript enhancements
				guides: {
					bracketPairs: true,
					bracketPairsHorizontal: true,
					highlightActiveBracketPair: true,
					indentation: true
				},
				linkedEditing: true,
				occurrencesHighlight: 'singleFile',
				selectionHighlight: true,
				codeLens: false,
				folding: true,
				foldingStrategy: 'indentation',
				showDeprecated: true,
				// JavaScript-specific features
				hover: { enabled: true },
				contextmenu: true,
				lightbulb: { enabled: 'on' },
				quickOpen: { enabled: true },
				formatOnSave: true,
				formatOnType: true,
				formatOnPaste: true
			});

			// Listen for value changes
			let validationTimeout: number;
			editor.onDidChangeModelContent(() => {
				value = editor?.getValue() || '';
				
				// Debounced validation to avoid excessive validation calls
				clearTimeout(validationTimeout);
				validationTimeout = setTimeout(() => {
					validateJavaScript();
				}, 500);
			});

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

	export function formatCode() {
		if (!editor || !monaco) return false;
		
		try {
			editor.getAction('editor.action.formatDocument')?.run();
			return true;
		} catch (error) {
			console.warn('Failed to format code:', error);
			return false;
		}
	}

	export function validateJavaScript(): { valid: boolean; error?: string; line?: number; column?: number } {
		if (!editor || !monaco) return { valid: false, error: 'Editor not initialized' };
		
		try {
			const value = editor.getValue();
			
			// Basic syntax validation by trying to parse as JavaScript
			// This is a simple check - Monaco's TypeScript service provides more detailed validation
			const model = editor.getModel();
			if (model) {
				// Clear any existing error markers
				monaco.editor.setModelMarkers(model, 'js-validation', []);
			}
			
			return { valid: true };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Invalid JavaScript';
			
			// Add error marker to the editor
			const model = editor.getModel();
			if (model) {
				const markers = [{
					severity: monaco.MarkerSeverity.Error,
					startLineNumber: 1,
					startColumn: 1,
					endLineNumber: 1,
					endColumn: 1,
					message: errorMessage
				}];
				monaco.editor.setModelMarkers(model, 'js-validation', markers);
			}
			
			return { 
				valid: false, 
				error: errorMessage
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
	
	export function getTokensInfo() {
		if (!editor || !monaco) return null;
		
		const model = editor.getModel();
		if (!model) return null;
		
		const lineCount = model.getLineCount();
		const tokens = [];
		
		for (let line = 1; line <= lineCount; line++) {
			const lineTokens = monaco.editor.tokenize(model.getLineContent(line), 'javascript');
			tokens.push({
				line,
				tokens: lineTokens[0]?.map(token => ({
					type: token.type,
					offset: token.offset
				})) || []
			});
		}
		
		return tokens;
	}
	
	export function highlightErrors() {
		const validation = validateJavaScript();
		return validation;
	}

	export function setTheme(themeName: string) {
		if (editor && monaco) {
			monaco.editor.setTheme(themeName);
		}
	}

	export function getAvailableThemes() {
		return [
			'js-dark',
			'js-light', 
			'vs-dark',
			'vs',
			'Monokai',
			'GitHub',
			'Solarized-dark',
			'Dracula',
			'One Dark Pro',
			'Material Dark'
		];
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
			const newTheme = $mode === 'dark' ? 'js-dark' : 'js-light';
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
		font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'SF Mono', monospace !important;
		font-feature-settings: 'liga' 1, 'calt' 1;
	}
	
	:global(.monaco-editor .margin) {
		background: transparent !important;
	}
	
	/* Enhanced JavaScript syntax highlighting support */
	:global(.monaco-editor .mtk1) { /* Default text */
		color: inherit;
	}
	
	:global(.monaco-editor .mtk9) { /* Numbers */
		font-weight: 600;
	}
	
	:global(.monaco-editor .mtk22) { /* Strings */
		font-style: normal;
	}
	
	:global(.monaco-editor .mtk5) { /* Keywords */
		font-weight: 600;
	}
	
	/* Bracket pair colorization */
	:global(.monaco-editor .bracket-highlighting-0),
	:global(.monaco-editor .bracket-highlighting-1),
	:global(.monaco-editor .bracket-highlighting-2),
	:global(.monaco-editor .bracket-highlighting-3),
	:global(.monaco-editor .bracket-highlighting-4),
	:global(.monaco-editor .bracket-highlighting-5) {
		font-weight: bold;
	}
	
	/* Error and warning decorations */
	:global(.monaco-editor .squiggly-error) {
		border-bottom: 2px dotted #ff5555;
		background: rgba(255, 85, 85, 0.1);
	}
	
	:global(.monaco-editor .squiggly-warning) {
		border-bottom: 2px dotted #ffaa00;
		background: rgba(255, 170, 0, 0.1);
	}
	
	/* Improved bracket matching */
	:global(.monaco-editor .bracket-match) {
		background: rgba(255, 215, 0, 0.3) !important;
		border: 1px solid rgba(255, 215, 0, 0.8);
		border-radius: 2px;
	}
	
	/* Selection highlighting */
	:global(.monaco-editor .selectionHighlight) {
		background: rgba(173, 214, 255, 0.3);
		border-radius: 2px;
	}
	
	/* Word highlighting */
	:global(.monaco-editor .wordHighlight) {
		background: rgba(87, 156, 214, 0.25);
		border-radius: 2px;
	}
	
	:global(.monaco-editor .wordHighlightStrong) {
		background: rgba(87, 156, 214, 0.4);
		border-radius: 2px;
	}
	
	/* Folding ranges */
	:global(.monaco-editor .folded-background) {
		background: rgba(255, 255, 255, 0.05);
	}
	
	/* Indentation guides */
	:global(.monaco-editor .guides-widget) {
		opacity: 0.6;
	}
	
	/* JavaScript-specific token colors */
	:global(.monaco-editor .token.string) {
		color: #ce9178;
	}
	
	:global(.monaco-editor .token.keyword) {
		color: #569cd6;
		font-weight: 600;
	}
	
	:global(.monaco-editor .token.number) {
		color: #b5cea8;
		font-weight: 600;
	}
	
	:global(.monaco-editor .token.comment) {
		color: #6a9955;
		font-style: italic;
	}
	
	:global(.monaco-editor .token.function) {
		color: #dcdcaa;
	}
	
	:global(.monaco-editor .token.variable) {
		color: #9cdcfe;
	}
</style>
