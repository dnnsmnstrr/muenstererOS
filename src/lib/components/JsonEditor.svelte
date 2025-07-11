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
		// Enhanced JSON editing features
		suggest: {
			showKeywords: true,
			showSnippets: true,
			showColors: true,
			showFiles: false,
			showReferences: false
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
		wordBasedSuggestions: 'off',
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
						case 'typescript':
						case 'javascript':
							return createWorker('ts.worker');
						default:
							return createWorker('editor.worker');
					}
				}
			};

			// Dynamically import Monaco to avoid SSR issues
			monaco = await import('monaco-editor');
			
			// Configure JSON validation and formatting with enhanced options
			monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
				validate: true,
				allowComments: false,
				schemas: [],
				enableSchemaRequest: true,
				schemaValidation: 'error',
				schemaRequest: 'warning'
			});

			// Configure JSON worker options for better performance
			monaco.languages.json.jsonDefaults.setModeConfiguration({
				documentFormattingEdits: true,
				documentRangeFormattingEdits: true,
				completionItems: true,
				hovers: true,
				documentSymbols: true,
				tokens: true,
				colors: true,
				foldingRanges: true,
				diagnostics: true,
				selectionRanges: true
			});

			// Register custom JSON completion provider for better IntelliSense
			monaco.languages.registerCompletionItemProvider('json', {
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
						{
							label: 'true',
							kind: monaco.languages.CompletionItemKind.Keyword,
							insertText: 'true',
							range
						},
						{
							label: 'false',
							kind: monaco.languages.CompletionItemKind.Keyword,
							insertText: 'false',
							range
						},
						{
							label: 'null',
							kind: monaco.languages.CompletionItemKind.Keyword,
							insertText: 'null',
							range
						},
						{
							label: '$schema',
							kind: monaco.languages.CompletionItemKind.Property,
							insertText: '"$schema": "${1:https://json.schemastore.org/package.json}"',
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							documentation: 'JSON Schema URL for validation and IntelliSense',
							range
						}
					];
					
					// Add common schema URL suggestions when typing $schema value
					const lineContent = model.getLineContent(position.lineNumber);
					const beforeCursor = lineContent.substring(0, position.column - 1);
					if (beforeCursor.includes('"$schema"') && beforeCursor.includes(':')) {
						const commonSchemas = getCommonSchemaUrls();
						const schemaSuggestions = commonSchemas.map(schema => ({
							label: schema.name,
							kind: monaco.languages.CompletionItemKind.Value,
							insertText: `"${schema.url}"`,
							documentation: schema.description,
							range
						}));
						suggestions.push(...schemaSuggestions);
					}
					
					return { suggestions };
				}
			});

			// Define custom color theme for better JSON syntax highlighting
			monaco.editor.defineTheme('json-dark', {
				base: 'vs-dark',
				inherit: true,
				rules: [
					{ token: 'string.key.json', foreground: '9CDCFE', fontStyle: 'bold' },
					{ token: 'string.value.json', foreground: 'CE9178' },
					{ token: 'number.json', foreground: 'B5CEA8', fontStyle: 'bold' },
					{ token: 'keyword.json', foreground: '569CD6', fontStyle: 'bold' },
					{ token: 'delimiter.bracket.json', foreground: 'FFD700', fontStyle: 'bold' },
					{ token: 'delimiter.array.json', foreground: 'FFD700', fontStyle: 'bold' },
					{ token: 'delimiter.colon.json', foreground: 'CCCCCC' },
					{ token: 'delimiter.comma.json', foreground: 'CCCCCC' },
					{ token: 'string', foreground: 'CE9178' },
					{ token: 'number', foreground: 'B5CEA8' },
					{ token: 'keyword', foreground: '569CD6' }
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

			monaco.editor.defineTheme('json-light', {
				base: 'vs',
				inherit: true,
				rules: [
					{ token: 'string.key.json', foreground: '0451A5', fontStyle: 'bold' },
					{ token: 'string.value.json', foreground: 'A31515' },
					{ token: 'number.json', foreground: '098658', fontStyle: 'bold' },
					{ token: 'keyword.json', foreground: '0000FF', fontStyle: 'bold' },
					{ token: 'delimiter.bracket.json', foreground: 'FF8C00', fontStyle: 'bold' },
					{ token: 'delimiter.array.json', foreground: 'FF8C00', fontStyle: 'bold' },
					{ token: 'delimiter.colon.json', foreground: '000000' },
					{ token: 'delimiter.comma.json', foreground: '000000' },
					{ token: 'string', foreground: 'A31515' },
					{ token: 'number', foreground: '098658' },
					{ token: 'keyword', foreground: '0000FF' }
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
				
				// Define additional popular themes for JSON editing
				const popularThemes = [
					'Monokai',
					'GitHub',
					'Solarized-dark',
					'Dracula'
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
			const currentTheme = $mode === 'dark' ? 'json-dark' : 'json-light';
			editor = monaco.editor.create(container, {
				value,
				language,
				theme: currentTheme,
				...defaultOptions,
				// Enhanced JSON-specific options
				bracketPairColorization: { enabled: true },
				colorDecorators: true,
				foldingHighlight: true,
				showFoldingControls: 'mouseover',
				matchBrackets: 'always',
				renderWhitespace: 'boundary',
				// Additional JSON enhancements
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
				showDeprecated: true
			});

			// Add JSON schema validation for common JSON structures
			// Start with a basic schema that allows any valid JSON
			const basicJsonSchema = {
				type: ['object', 'array', 'string', 'number', 'boolean', 'null'],
				properties: {},
				additionalProperties: true,
				items: {
					type: ['object', 'array', 'string', 'number', 'boolean', 'null']
				}
			};

			const jsonSchemas = [
				{
					uri: 'http://json-schema.org/draft-07/schema#basic',
					fileMatch: ['*'],
					schema: basicJsonSchema
				}
			];

			monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
				validate: true,
				allowComments: false,
				schemas: jsonSchemas,
				enableSchemaRequest: true,
				schemaValidation: 'error',
				schemaRequest: 'warning'
			});

			// Listen for value changes and auto-validate
			let validationTimeout: number;
			let schemaTimeout: number;
			editor.onDidChangeModelContent(() => {
				value = editor?.getValue() || '';
				
				// Debounced validation to avoid excessive validation calls
				clearTimeout(validationTimeout);
				validationTimeout = setTimeout(() => {
					validateJson();
				}, 500);
				
				// Auto-detect schema after content changes (less frequent)
				clearTimeout(schemaTimeout);
				schemaTimeout = setTimeout(() => {
					autoDetectSchema();
				}, 2000);
			});

			// Format JSON on initial load
			if (language === 'json') {
				formatJson();
				// Auto-detect schema on initial load
				setTimeout(() => {
					autoDetectSchema();
				}, 100);
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

	export function validateJson(): { valid: boolean; error?: string; line?: number; column?: number } {
		if (!editor || !monaco) return { valid: false, error: 'Editor not initialized' };
		
		try {
			const value = editor.getValue();
			JSON.parse(value);
			
			// Clear any existing error markers
			const model = editor.getModel();
			if (model) {
				monaco.editor.setModelMarkers(model, 'json-validation', []);
			}
			
			return { valid: true };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
			
			// Try to extract line and column information from error message
			const lineMatch = errorMessage.match(/line (\d+)/);
			const columnMatch = errorMessage.match(/column (\d+)/);
			const positionMatch = errorMessage.match(/position (\d+)/);
			
			let line = lineMatch ? parseInt(lineMatch[1]) : undefined;
			let column = columnMatch ? parseInt(columnMatch[1]) : undefined;
			
			// If we have position but not line/column, calculate them
			if (positionMatch && !line && !column) {
				const position = parseInt(positionMatch[1]);
				const text = editor.getValue();
				const lines = text.substring(0, position).split('\n');
				line = lines.length;
				column = lines[lines.length - 1].length + 1;
			}
			
			// Add error marker to the editor
			const model = editor.getModel();
			if (model && line && column) {
				const markers = [{
					severity: monaco.MarkerSeverity.Error,
					startLineNumber: line,
					startColumn: column,
					endLineNumber: line,
					endColumn: column + 1,
					message: errorMessage
				}];
				monaco.editor.setModelMarkers(model, 'json-validation', markers);
			}
			
			return { 
				valid: false, 
				error: errorMessage,
				line,
				column
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
			
			// Auto-detect schema for the new content
			setTimeout(() => {
				autoDetectSchema();
			}, 100);
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
			const lineTokens = monaco.editor.tokenize(model.getLineContent(line), 'json');
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
		const validation = validateJson();
		return validation;
	}

	export function setTheme(themeName: string) {
		if (editor && monaco) {
			monaco.editor.setTheme(themeName);
		}
	}

	export function getAvailableThemes() {
		return [
			'json-dark',
			'json-light', 
			'vs-dark',
			'vs',
			'Monokai',
			'GitHub',
			'Solarized-dark',
			'Dracula'
		];
	}

	export function enableJsonSchema(schema: any, uri?: string) {
		if (!monaco) return;
		
		const schemaUri = uri || `http://json-schema.org/draft-07/schema#${Date.now()}`;
		const jsonSchemas = [{
			uri: schemaUri,
			fileMatch: ['*'],
			schema
		}];

		monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
			validate: true,
			allowComments: false,
			schemas: jsonSchemas,
			enableSchemaRequest: true,
			schemaValidation: 'error',
			schemaRequest: 'warning'
		});
		
		// Force re-validation after schema change
		setTimeout(() => {
			validateJson();
		}, 100);
	}

	// Add common JSON schemas for different data types
	export function setCommonSchema(schemaType: 'gist' | 'config' | 'package' | 'tsconfig' | 'custom', customSchema?: any) {
		const schemas = {
			gist: {
				type: 'object',
				properties: {
					id: { type: 'string' },
					description: { type: 'string' },
					public: { type: 'boolean' },
					files: {
						type: 'object',
						patternProperties: {
							'.*': {
								type: 'object',
								properties: {
									filename: { type: 'string' },
									content: { type: 'string' },
									raw_url: { type: 'string' }
								},
								required: ['filename', 'content']
							}
						}
					},
					created_at: { type: 'string', format: 'date-time' },
					updated_at: { type: 'string', format: 'date-time' }
				},
				required: ['id', 'files']
			},
			config: {
				type: 'object',
				properties: {
					name: { type: 'string' },
					version: { type: 'string' },
					description: { type: 'string' },
					settings: {
						type: 'object',
						properties: {
							theme: { type: 'string', enum: ['light', 'dark', 'auto'] },
							language: { type: 'string' },
							autoSave: { type: 'boolean' }
						}
					}
				},
				required: ['name', 'version']
			},
			package: {
				type: 'object',
				properties: {
					name: { type: 'string' },
					version: { type: 'string' },
					description: { type: 'string' },
					main: { type: 'string' },
					scripts: {
						type: 'object',
						patternProperties: {
							'.*': { type: 'string' }
						}
					},
					dependencies: {
						type: 'object',
						patternProperties: {
							'.*': { type: 'string' }
						}
					},
					devDependencies: {
						type: 'object',
						patternProperties: {
							'.*': { type: 'string' }
						}
					},
					keywords: {
						type: 'array',
						items: { type: 'string' }
					},
					author: { type: 'string' },
					license: { type: 'string' }
				},
				required: ['name', 'version']
			},
			tsconfig: {
				type: 'object',
				properties: {
					compilerOptions: {
						type: 'object',
						properties: {
							target: { type: 'string', enum: ['es5', 'es6', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'esnext'] },
							module: { type: 'string', enum: ['commonjs', 'amd', 'umd', 'system', 'es6', 'es2015', 'esnext'] },
							lib: { type: 'array', items: { type: 'string' } },
							outDir: { type: 'string' },
							rootDir: { type: 'string' },
							strict: { type: 'boolean' },
							esModuleInterop: { type: 'boolean' },
							skipLibCheck: { type: 'boolean' },
							forceConsistentCasingInFileNames: { type: 'boolean' }
						}
					},
					include: { type: 'array', items: { type: 'string' } },
					exclude: { type: 'array', items: { type: 'string' } }
				}
			},
			custom: customSchema || {
				type: 'object',
				properties: {},
				additionalProperties: true
			}
		};

		enableJsonSchema(schemas[schemaType], `http://json-schema.org/${schemaType}-schema`);
	}

	// Auto-detect schema based on JSON content
	export function autoDetectSchema() {
		if (!editor) return;
		
		try {
			const content = editor.getValue();
			const parsed = JSON.parse(content);
			
			// First check for explicit $schema property
			if (parsed.$schema && typeof parsed.$schema === 'string') {
				const schemaUrl = parsed.$schema;
				
				// Try to fetch and apply the schema from the URL
				fetchSchemaFromUrl(schemaUrl);
				return 'schema-url';
			}
			
			// Check for package.json
			if (parsed.name && parsed.version && (parsed.dependencies || parsed.devDependencies || parsed.scripts)) {
				setCommonSchema('package');
				return 'package';
			}
			
			// Check for tsconfig.json
			if (parsed.compilerOptions) {
				setCommonSchema('tsconfig');
				return 'tsconfig';
			}
			
			// Check for GitHub gist structure
			if (parsed.id && parsed.files && typeof parsed.files === 'object') {
				setCommonSchema('gist');
				return 'gist';
			}
			
			// Check for config-like structure
			if (parsed.name && parsed.version && parsed.settings) {
				setCommonSchema('config');
				return 'config';
			}
			
			// Default to custom schema
			setCommonSchema('custom');
			return 'custom';
		} catch (error) {
			// If JSON is invalid, use basic schema
			return null;
		}
	}

	// Fetch schema from URL and apply it
	async function fetchSchemaFromUrl(schemaUrl: string) {
		try {
			// Handle common schema URLs
			const knownSchemas = getKnownSchemaUrls();
			
			// Check if it's a known schema URL
			const knownSchema = knownSchemas.find(s => s.url === schemaUrl || s.aliases?.includes(schemaUrl));
			if (knownSchema) {
				if (knownSchema.type === 'common') {
					setCommonSchema(knownSchema.schema as any);
				} else {
					enableJsonSchema(knownSchema.schema, schemaUrl);
				}
				return;
			}
			
			// Try to fetch the schema from the URL
			const response = await fetch(schemaUrl);
			if (response.ok) {
				const schema = await response.json();
				enableJsonSchema(schema, schemaUrl);
			} else {
				console.warn(`Failed to fetch schema from ${schemaUrl}: ${response.status}`);
				// Fall back to basic schema detection
				setCommonSchema('custom');
			}
		} catch (error) {
			console.warn(`Error fetching schema from ${schemaUrl}:`, error);
			// Fall back to basic schema detection
			setCommonSchema('custom');
		}
	}

	// Get known schema URLs with their corresponding schemas
	function getKnownSchemaUrls() {
		return [
			{
				url: 'https://json.schemastore.org/package.json',
				aliases: ['http://json.schemastore.org/package.json', 'https://json.schemastore.org/package'],
				type: 'common',
				schema: 'package'
			},
			{
				url: 'https://json.schemastore.org/tsconfig.json',
				aliases: ['http://json.schemastore.org/tsconfig.json', 'https://json.schemastore.org/tsconfig'],
				type: 'common',
				schema: 'tsconfig'
			},
			{
				url: 'https://json.schemastore.org/eslintrc.json',
				aliases: ['http://json.schemastore.org/eslintrc.json'],
				type: 'schema',
				schema: {
					type: 'object',
					properties: {
						env: {
							type: 'object',
							properties: {
								browser: { type: 'boolean' },
								node: { type: 'boolean' },
								es6: { type: 'boolean' },
								jest: { type: 'boolean' }
							}
						},
						extends: {
							oneOf: [
								{ type: 'string' },
								{ type: 'array', items: { type: 'string' } }
							]
						},
						rules: {
							type: 'object',
							patternProperties: {
								'.*': {
									oneOf: [
										{ type: 'string', enum: ['off', 'warn', 'error'] },
										{ type: 'number', enum: [0, 1, 2] },
										{ type: 'array', minItems: 1, maxItems: 2 }
									]
								}
							}
						},
						parser: { type: 'string' },
						parserOptions: {
							type: 'object',
							properties: {
								ecmaVersion: { type: 'number' },
								sourceType: { type: 'string', enum: ['script', 'module'] }
							}
						}
					}
				}
			},
			{
				url: 'https://json.schemastore.org/prettierrc.json',
				aliases: ['http://json.schemastore.org/prettierrc.json'],
				type: 'schema',
				schema: {
					type: 'object',
					properties: {
						printWidth: { type: 'number' },
						tabWidth: { type: 'number' },
						useTabs: { type: 'boolean' },
						semi: { type: 'boolean' },
						singleQuote: { type: 'boolean' },
						quoteProps: { type: 'string', enum: ['as-needed', 'consistent', 'preserve'] },
						trailingComma: { type: 'string', enum: ['none', 'es5', 'all'] },
						bracketSpacing: { type: 'boolean' },
						arrowParens: { type: 'string', enum: ['avoid', 'always'] }
					}
				}
			},
			{
				url: 'http://json-schema.org/draft-07/schema#',
				aliases: ['https://json-schema.org/draft-07/schema#'],
				type: 'schema',
				schema: {
					type: 'object',
					properties: {
						$schema: { type: 'string' },
						$id: { type: 'string' },
						title: { type: 'string' },
						description: { type: 'string' },
						type: {
							oneOf: [
								{ type: 'string' },
								{ type: 'array', items: { type: 'string' } }
							]
						},
						properties: { type: 'object' },
						required: { type: 'array', items: { type: 'string' } },
						additionalProperties: { type: 'boolean' }
					}
				}
			}
		];
	}

	// Add $schema property to JSON
	export function addSchemaProperty(schemaUrl: string) {
		if (!editor) return false;
		
		try {
			const content = editor.getValue();
			const parsed = JSON.parse(content);
			
			// Add $schema property at the beginning
			const newObj = {
				$schema: schemaUrl,
				...parsed
			};
			
			const formatted = JSON.stringify(newObj, null, 2);
			editor.setValue(formatted);
			value = formatted;
			
			// Auto-detect schema after adding the property
			setTimeout(() => {
				autoDetectSchema();
			}, 100);
			
			return true;
		} catch (error) {
			console.warn('Failed to add $schema property:', error);
			return false;
		}
	}

	// Get common schema URLs for easy reference
	export function getCommonSchemaUrls() {
		return [
			{
				name: 'Package.json',
				url: 'https://json.schemastore.org/package.json',
				description: 'NPM package.json schema'
			},
			{
				name: 'TSConfig.json',
				url: 'https://json.schemastore.org/tsconfig.json',
				description: 'TypeScript configuration schema'
			},
			{
				name: 'ESLint Config',
				url: 'https://json.schemastore.org/eslintrc.json',
				description: 'ESLint configuration schema'
			},
			{
				name: 'Prettier Config',
				url: 'https://json.schemastore.org/prettierrc.json',
				description: 'Prettier configuration schema'
			},
			{
				name: 'JSON Schema Draft 07',
				url: 'http://json-schema.org/draft-07/schema#',
				description: 'JSON Schema meta-schema'
			}
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
	/* Ensure Monaco Editor styles are properly scoped */
	:global(.monaco-editor) {
		font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'SF Mono', monospace !important;
		font-feature-settings: 'liga' 1, 'calt' 1;
	}
	
	:global(.monaco-editor .margin) {
		background: transparent !important;
	}
	
	/* Enhanced JSON syntax highlighting support */
	:global(.monaco-editor .mtk1) { /* Default text */
		color: inherit;
	}
	
	:global(.monaco-editor .mtk9) { /* JSON numbers */
		font-weight: 600;
	}
	
	:global(.monaco-editor .mtk22) { /* JSON strings */
		font-style: normal;
	}
	
	:global(.monaco-editor .mtk5) { /* JSON keys */
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
	
	/* JSON-specific token colors */
	:global(.monaco-editor .token.string.value) {
		color: #ce9178;
	}
	
	:global(.monaco-editor .token.string.key) {
		color: #9cdcfe;
		font-weight: 600;
	}
	
	:global(.monaco-editor .token.number) {
		color: #b5cea8;
		font-weight: 600;
	}
	
	:global(.monaco-editor .token.keyword) {
		color: #569cd6;
		font-weight: 600;
	}
</style>
