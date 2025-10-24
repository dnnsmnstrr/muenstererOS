<script lang="ts">
	import { onMount } from 'svelte';
	import JSEditor from '$lib/components/JSEditor.svelte';

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

const input = document.createElement('input');
input.type = 'text';
input.placeholder = 'Enter your name';
const result = document.createElement('span');

output.append(input);
output.append(result);

input.addEventListener('input', (e) => {
    console.log('Input value:', e.target.value);
    result.innerHTML = e.target.value;
});

`;

	let jsCode = $state(defaultCode);
	
	let executionResult = $state('');
	let executionError = $state('');
	let outputContainer: HTMLDivElement;
	let jsEditor: JSEditor;
	let debounceTimer: number;

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
					logs.push(args.map(arg => 
						typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
					).join(' '));
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
					},
				};
				
				func(mockDocument);
				
				// Restore original console.log
				console.log = originalConsoleLog;
				
				executionResult = logs.join('\n') || 'Code executed successfully (no console output)';
			} catch (error) {
				executionError = error instanceof Error ? error.message : 'Execution error';
				executionResult = '';
			}
		}, 300); // 300ms debounce
	}

	$effect(() => {
		if (jsCode) executeCode();
	});

	function resetCode() {
		jsCode = defaultCode;
	}

	function clearOutput() {
		executionResult = '';
		executionError = '';
		jsCode = defaultCode;
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
<div class="h-full flex flex-col bg-background">
	<!-- Top toolbar -->
	<div class="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
		<div class="flex items-center gap-4">
			<h1 class="text-lg font-semibold">⚡ {title}</h1>
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
				<span>Live execution</span>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<button 
				onclick={resetCode}
				class="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
			>
				Reset
			</button>
			<button 
				onclick={clearOutput}
				class="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
			>
				Clear Output
			</button>
		</div>
	</div>

	<!-- Main content area -->
	<div class="flex-1 flex overflow-hidden">
		<!-- Left panel - Code Editor -->
		<div class="flex-1 flex flex-col border-r">
			<div class="px-4 py-2 bg-muted/20 border-b">
				<h2 class="text-sm font-medium">Editor</h2>
			</div>
			<div class="flex-1 relative">
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
		<div class="flex-1 flex flex-col">
			<div class="px-4 py-2 bg-muted/20 border-b">
				<h2 class="text-sm font-medium">Output</h2>
			</div>
			<div class="flex-1 overflow-auto p-4 bg-muted/10">
				{#if executionError}
					<div class="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
						<div class="flex items-center gap-2 mb-2">
							<span class="text-destructive font-semibold">Error</span>
						</div>
						<pre class="text-sm text-destructive font-mono whitespace-pre-wrap">{executionError}</pre>
					</div>
				{/if}
				
				{#if executionResult}
					<div class="mb-4">
						<div class="flex items-center gap-2 mb-2">
							<span class="text-sm font-semibold text-muted-foreground">Console Output</span>
						</div>
						<pre class="text-sm font-mono whitespace-pre-wrap bg-background p-3 rounded-md border">{executionResult}</pre>
					</div>
				{/if}
				
				<!-- HTML Output Container -->
				<div bind:this={outputContainer} class="empty:hidden"></div>
				
				{#if !executionResult && !executionError}
					<div class="flex items-center justify-center h-full text-center">
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


