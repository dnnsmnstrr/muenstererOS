<script lang="ts">
	import { onMount } from 'svelte';
	import JSEditor from '$lib/components/JSEditor.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ChevronDown, Eye, RotateCw, X } from 'lucide-svelte';
	import snippets from './snippets.json';

	const defaultCode = `// Welcome to the Real-Time JavaScript Editor!
// Code executes automatically as you type

function greet(name) {
    return "Hello, " + name + "!";
}

// Try these examples:
console.log(greet('World'));
console.log('Current time:', new Date().toLocaleTimeString());

// DOM Examples:
const output = document.getElementById('output');
output.innerHTML = '<h2>Hello HTML!</h2>';
// output.style.color = 'red';
`;

	let jsCode = $state(defaultCode);

	let executionResult = $state('');
	let executionError = $state('');
	let outputContainer: HTMLDivElement;
	let jsEditor: JSEditor;
	let showOutput = $state(false);
	let debounceTimer: number;
	const DEBOUNCE_TIME = 500;

	function loadSnippet(snippet: (typeof snippets)[0]) {
		jsCode = snippet.code;
		// Focus the editor after loading snippet
		setTimeout(() => {
			jsEditor?.setValue(snippet.code);
			jsEditor?.focus();
		}, 100);
	}

	// Execute the JavaScript code with debouncing
	function executeCode() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			try {
				executionError = '';
				executionResult = '';

				// Create a safe execution environment
				const logs: string[] = [];
				const originalConsoleLog = console.log;

				// Override console.log to capture output
				console.log = (...args: any[]) => {
					logs.push(
						args
							.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
							.join(' ')
					);
					originalConsoleLog(...args);
				};

				const func = new Function('document', jsCode);

				const mockDocument = {
					getElementById: (id: string) => {
						if (id === 'output') {
							return outputContainer;
						}
						if (outputContainer) {
							const element = outputContainer.querySelector(`#${id}`);
							return element;
						}
						return null;
					},
					querySelector: (selector: string) => {
						if (outputContainer) {
							return outputContainer.querySelector(selector);
						}
						return null;
					},
					querySelectorAll: (selector: string) => {
						if (outputContainer) {
							return outputContainer.querySelectorAll(selector);
						}
						return [];
					},
					createElement: (tagName: string) => {
						return document.createElement(tagName);
					}
				};

				func(mockDocument);

				// Restore original console.log
				console.log = originalConsoleLog;

				executionResult = logs.join('\n') || 'Code executed successfully (no console output)';
			} catch (error) {
				executionError = error instanceof Error ? error.message : 'Execution error';
				executionResult = '';
			}
		}, DEBOUNCE_TIME);
	}

	$effect(() => {
		if (jsCode) executeCode();
	});

	function resetCode() {
		jsCode = defaultCode;
		jsEditor?.setValue(defaultCode);
		jsEditor?.focus();
	}

	function clearOutput() {
		executionResult = '';
		executionError = '';
		if (outputContainer) {
			outputContainer.innerHTML = '';
		}
	}

	onMount(executeCode);
	const title = 'JavaScript Playground';
</script>

<svelte:head>
	<title>{title} | muenstererOS</title>
	<meta name="description" content="A playground for JavaScript code with instant execution" />
</svelte:head>

<!-- Full-screen split-pane layout -->
<div class="flex h-full flex-col bg-background">
	<!-- Top toolbar -->
	<div
		class="flex flex-col items-center justify-between gap-3 border-b bg-muted/30 px-4 py-2 md:flex-row"
	>
		<div class="flex w-full items-center justify-between gap-4 md:w-auto">
			<h1 class="text-lg font-semibold">⚡ {title}</h1>
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
				<span>Live execution</span>
			</div>
		</div>
		<div class="flex w-full items-center justify-between gap-2 md:w-auto">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="outline" size="sm" class="gap-2">
						🎨 Snippets
						<ChevronDown class="h-4 w-4" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-80">
					<DropdownMenu.Label>Snippets</DropdownMenu.Label>
					<DropdownMenu.Separator />
					{#each snippets as snippet}
						<DropdownMenu.Item onclick={() => loadSnippet(snippet)} class="cursor-pointer">
							<div class="flex flex-col items-start">
								<div class="font-medium">{snippet.name}</div>
								<div class="text-xs text-muted-foreground">{snippet.description}</div>
							</div>
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<div class="flex items-center gap-2">
				<button
					onclick={resetCode}
					class="rounded-md bg-muted px-3 py-1 text-sm transition-colors hover:bg-muted/80"
				>
					Reset
				</button>
				<button
					onclick={clearOutput}
					class="rounded-md bg-muted px-3 py-1 text-sm transition-colors hover:bg-muted/80"
				>
					Clear Output
				</button>
			</div>
		</div>
	</div>

	<!-- Main content area -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Left panel - Code Editor -->
		<div class="{!showOutput ? 'flex' : 'hidden'} flex w-full flex-1 flex-col border-r md:w-auto md:flex-1">
			<div class="flex items-center justify-between border-b bg-muted/20 px-4 py-2">
				<h2 class="text-sm font-medium">Editor</h2>
				<Button variant="ghost" class="md:hidden" size="icon" onclick={() => (showOutput = true)}>
					<Eye class="h-4 w-4" />
				</Button>
			</div>
			<div class="relative flex-1">
				<JSEditor
					bind:this={jsEditor}
					bind:value={jsCode}
					language="javascript"
					height="100%"
					readonly={false}
				/>
			</div>
		</div>
		<!-- Right panel - Output -->
		<div class="{showOutput ? 'flex' : 'hidden'} flex-1 flex-col md:flex md:flex-2 lg:flex-1">
			<div class="flex items-center justify-between border-b bg-muted/20 px-4 py-2">
				<h2 class="text-sm font-medium">Output</h2>
				<div class="flex items-center gap-2">
					<Button variant="ghost" size="icon" onclick={executeCode}>
						<RotateCw class="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="icon" class="md:hidden" onclick={() => (showOutput = false)}>
						<X class="h-4 w-4" />
					</Button>
				</div>
			</div>
			<div class="flex-1 overflow-auto bg-muted/10 p-4">
				{#if executionError}
					<div class="mb-4 rounded-md border border-destructive/20 bg-destructive/10 p-3">
						<div class="mb-2 flex items-center gap-2">
							<span class="font-semibold text-destructive">Error</span>
						</div>
						<pre
							class="whitespace-pre-wrap font-mono text-sm text-destructive">{executionError}</pre>
					</div>
				{/if}

				{#if executionResult}
					<div class="mb-4">
						<div class="mb-2 flex items-center gap-2">
							<span class="text-sm font-semibold text-muted-foreground">Console Output</span>
						</div>
						<pre
							class="whitespace-pre-wrap rounded-md border bg-background p-3 font-mono text-sm">{executionResult}</pre>
					</div>
				{/if}

				<!-- HTML Output Container -->
				<div bind:this={outputContainer} class="empty:hidden"></div>

				{#if !executionResult && !executionError}
					<div class="flex h-full items-center justify-center text-center">
						<div class="text-muted-foreground">
							<p class="mb-2">Start typing to see live execution</p>
							<p class="text-sm">Code runs automatically as you type</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	/* Custom scrollbar for the output panel */
	:global(.overflow-auto::-webkit-scrollbar) {
		width: 6px;
	}

	:global(.overflow-auto::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(.overflow-auto::-webkit-scrollbar-thumb) {
		background: hsl(var(--muted-foreground) / 0.3);
		border-radius: 3px;
	}

	:global(.overflow-auto::-webkit-scrollbar-thumb:hover) {
		background: hsl(var(--muted-foreground) / 0.5);
	}
</style>
