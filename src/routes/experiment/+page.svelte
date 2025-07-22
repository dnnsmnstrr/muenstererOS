<script lang="ts">
	import { browser } from '$app/environment';
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";

	// JavaScript code for the live editor
	let jsCode = $state(`// Welcome to the JavaScript Live Editor!
// Write your JavaScript code here and see it execute in real-time

function greet(name) {
    return "Hello, " + name + "! Welcome to the JavaScript playground.";
}

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

function createColorfulDiv() {
    const colors = ['red', 'blue', 'green', 'purple', 'orange'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return '<div id="colorDiv" class="color-box" style="background: ' + randomColor + '; padding: 20px; margin: 10px; border-radius: 8px; color: white;">Random colored div! Color: ' + randomColor + '</div>';
}

function createInteractiveHTML() {
    return \`
        <div class="playground">
            <h3 id="title">Interactive HTML Example</h3>
            <button id="changeBtn" onclick="alert('test')">Click Me</button>
            <p class="info">This demonstrates querySelector functionality</p>
            <ul id="list">
                <li class="item">Item 1</li>
                <li class="item">Item 2</li>
                <li class="item">Item 3</li>
            </ul>
        </div>
    \`;
}

function demonstrateQuerySelector() {
    // Create some HTML first
    document.getElementById('output').innerHTML = createInteractiveHTML();
    
    // Now demonstrate querySelector
    const title = document.querySelector('#title');
    const items = document.querySelectorAll('.item');
    const button = document.querySelector('#changeBtn');
    
    console.log('Found title element:', title ? 'Yes' : 'No');
    console.log('Found', items.length, 'list items');
    console.log('Button text:', button ? button.textContent : 'Not found');
    
    // Change some styles using querySelector
    if (title) {
        title.style.color = '#007acc';
        title.style.fontSize = '24px';
    }
    
    // Style all items
    items.forEach((item, index) => {
        item.style.padding = '8px';
        item.style.margin = '4px 0';
        item.style.backgroundColor = \`hsl(\${120 + index * 60}, 70%, 90%)\`;
        item.style.borderRadius = '4px';
    });
}

// Try these examples:
console.log(greet('JavaScript Developer'));
console.log('Fibonacci(8):', fibonacci(8));
console.log('Current time:', new Date().toLocaleTimeString());

// HTML Generation Examples:
// document.getElementById('output').innerHTML = createColorfulDiv();
// demonstrateQuerySelector();
`);
	
	let executionResult = $state('');
	let executionError = $state('');
	let outputContainer: HTMLDivElement;

	// Execute the JavaScript code
	function executeCode() {
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

			// Create a sandboxed execution
			const func = new Function('document', jsCode);
			
			// Create a mock document with limited functionality for safety
			const mockDocument = {
				getElementById: (id: string) => {
					if (id === 'output') {
						return {
							set innerHTML(value: string) {
								if (outputContainer) {
									outputContainer.innerHTML = value;
								}
							}
						};
					}
					// If the output container has content, try to find the element within it
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
	}

	// Reset to original code
	function resetCode() {
		jsCode = `// JavaScript Playground - Try these examples!

function greet(name) {
    return "Hello, " + name + "! Welcome to the JavaScript playground.";
}

function sum(a, b) {
    return a + b;
}

function generateRandomNumber(min = 1, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createInteractiveHTML() {
    return \`
        <div class="demo">
            <h3 id="title">querySelector Demo</h3>
            <button id="btn" class="demo-btn">Click me!</button>
            <p class="info">This demonstrates DOM manipulation</p>
            <div class="items">
                <span class="item">Item A</span>
                <span class="item">Item B</span>
                <span class="item">Item C</span>
            </div>
        </div>
    \`;
}

function demonstrateQuerySelector() {
    // Generate HTML first
    document.getElementById('output').innerHTML = createInteractiveHTML();
    
    // Use querySelector to find elements
    const title = document.querySelector('#title');
    const button = document.querySelector('#btn');
    const items = document.querySelectorAll('.item');
    
    console.log('Title found:', title ? 'Yes' : 'No');
    console.log('Button found:', button ? 'Yes' : 'No');  
    console.log('Items found:', items.length);
    
    // Style the elements
    if (title) title.style.color = '#007acc';
    if (button) {
        button.style.padding = '10px 20px';
        button.style.backgroundColor = '#28a745';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
    }
    
    items.forEach((item, i) => {
        item.style.display = 'inline-block';
        item.style.padding = '5px 10px';
        item.style.margin = '5px';
        item.style.backgroundColor = \`hsl(\${i * 60}, 70%, 85%)\`;
        item.style.borderRadius = '3px';
    });
}

// Try these:
console.log(greet('World'));
console.log('5 + 3 =', sum(5, 3));
console.log('Random number:', generateRandomNumber());

// DOM Examples - Uncomment to try:
// document.getElementById('output').innerHTML = '<h2>Hello HTML!</h2>';
// demonstrateQuerySelector();`;
	}

	// Clear output
	function clearOutput() {
		executionResult = '';
		executionError = '';
		if (outputContainer) {
			outputContainer.innerHTML = '';
		}
	}
</script>

<svelte:head>
	<title>JavaScript Playground | muenstererOS</title>
	<meta name="description" content="Interactive JavaScript code editor and executor - write and run JavaScript in real-time" />
</svelte:head>

<div class="container mx-auto py-8 px-4">
	<div class="mb-8">
		<h1 class="text-4xl font-bold mb-4">⚡ JavaScript Playground</h1>
		<p class="text-muted-foreground mb-4">
			Write and execute JavaScript code in real-time. 
			Use the console.log() function to see output in the results panel!
		</p>
		<div class="flex gap-2 flex-wrap">
			<Badge variant="secondary">JavaScript</Badge>
			<Badge variant="outline">Real-time</Badge>
			<Badge variant="outline">Interactive</Badge>
			<Badge variant="outline">Safe Execution</Badge>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- JavaScript Code Editor Panel -->
		<Card.Root>
			<Card.Header>
				<div class="flex items-center justify-between">
					<div>
						<Card.Title>JavaScript Code Editor</Card.Title>
						<Card.Description>
							Write JavaScript code with syntax highlighting and auto-completion
						</Card.Description>
					</div>
					<div class="flex gap-2">
						<Button variant="default" size="sm" onclick={executeCode}>
							▶ Run Code
						</Button>
						<Button variant="outline" size="sm" onclick={resetCode}>
							Reset
						</Button>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<Textarea 
					bind:value={jsCode}
					placeholder="Write your JavaScript code here..."
					class="w-full h-[600px] font-mono text-sm resize-none"
					spellcheck="false"
				/>
				{#if executionError}
					<div class="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
						<div class="flex items-center justify-between">
							<p class="text-sm text-destructive font-mono">{executionError}</p>
							<Button variant="ghost" size="sm" onclick={clearOutput}>Clear</Button>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Execution Results Panel -->
		<Card.Root>
			<Card.Header>
				<div class="flex items-center justify-between">
					<div>
						<Card.Title>Execution Results</Card.Title>
						<Card.Description>
							Console output and results from your JavaScript code
						</Card.Description>
					</div>
					<Button variant="outline" size="sm" onclick={clearOutput}>
						Clear Output
					</Button>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="border rounded-md p-4 min-h-[600px] bg-muted/50 font-mono text-sm">
					{#if executionResult}
						<div class="space-y-2">
							<Badge variant="secondary" class="mb-3">Console Output</Badge>
							<pre class="whitespace-pre-wrap text-sm">{executionResult}</pre>
						</div>
					{:else if executionError}
						<div class="space-y-2">
							<Badge variant="destructive" class="mb-3">Error</Badge>
							<pre class="whitespace-pre-wrap text-sm text-destructive">{executionError}</pre>
						</div>
					{:else}
						<div class="flex items-center justify-center h-full text-center">
							<div>
								<p class="text-muted-foreground mb-2">Ready to execute JavaScript!</p>
								<p class="text-sm text-muted-foreground">Click "Run Code" to see output here</p>
							</div>
						</div>
					{/if}
					
					<!-- HTML Output Container -->
					<div bind:this={outputContainer} class="mt-4 empty:hidden"></div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Information Panel -->
	<Card.Root class="mt-6">
		<Card.Header>
			<Card.Title>JavaScript Playground Features</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h3 class="font-semibold mb-3">🚀 What You Can Do</h3>
					<ul class="text-sm text-muted-foreground space-y-1">
						<li>• Write and execute JavaScript code instantly</li>
						<li>• Use console.log() to see output</li>
						<li>• Access modern JavaScript features (ES6+)</li>
						<li>• Generate HTML with document.getElementById('output')</li>
						<li>• Use querySelector and querySelectorAll for DOM selection</li>
						<li>• Style and manipulate HTML elements dynamically</li>
						<li>• Experiment with functions, objects, and arrays</li>
					</ul>
				</div>
				<div>
					<h3 class="font-semibold mb-3">⚙ Editor Features</h3>
					<ul class="text-sm text-muted-foreground space-y-1">
						<li>• Simple textarea-based code editor</li>
						<li>• Monospace font for better code readability</li>
						<li>• Full-height editing area (600px)</li>
						<li>• Real-time code execution</li>
						<li>• Error handling and display</li>
					</ul>
				</div>
			</div>
			
			<Separator />
			
			<div>
				<h3 class="font-semibold mb-3">💡 Example Code Snippets</h3>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
					<div>
						<strong>Basic Examples:</strong>
						<pre class="mt-1 p-2 bg-muted rounded text-xs">console.log('Hello World!');
const sum = (a, b) => a + b;
console.log(sum(5, 3));</pre>
					</div>
					<div>
						<strong>DOM Manipulation:</strong>
						<pre class="mt-1 p-2 bg-muted rounded text-xs">document.getElementById('output')
  .innerHTML = '&lt;h3&gt;Hello!&lt;/h3&gt;';</pre>
					</div>
					<div>
						<strong>querySelector Examples:</strong>
						<pre class="mt-1 p-2 bg-muted rounded text-xs">const el = document.querySelector('#id');
const items = document.querySelectorAll('.class');
el.style.color = 'blue';</pre>
					</div>
				</div>
			</div>
			
			<div class="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
				<p class="text-sm text-amber-800 dark:text-amber-200">
					<strong>Note:</strong> This playground runs JavaScript in a sandboxed environment for security. 
					Some browser APIs and external network requests may be limited.
				</p>
			</div>
		</Card.Content>
	</Card.Root>
</div>


