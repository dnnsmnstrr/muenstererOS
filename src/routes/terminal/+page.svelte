<script lang="ts" module>
	type Line = { value: string; type?: 'input' | 'output' };
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
    import { tick } from 'svelte';
    import { onMount } from 'svelte';

	import Heading from '$lib/components/typography/Heading.svelte';
	import * as Terminal from '$lib/components/ui/terminal';
	import { debugLog } from '$lib/stores/app';
	import { endpoints } from '../api/+page.svelte';

	const pageTitle = 'Terminal';
	const pageDescription = 'A command line interface for the muenstererOS website.';
	const lines = $state<Line[]>([]);
    let linesContainer = $state<HTMLDivElement | null>(null);
    let currentDirectory = $state<string>('~');
	let isIntroComplete = $state(false);

    // Command history state
    let commandHistory = $state<string[]>([]);
    let historyIndex = $state<number | null>(null);

    const HISTORY_KEY = 'terminalCommandHistory';
    function saveHistory(historyData: string[] = commandHistory) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
    }

    // Load command history from localStorage on mount
    onMount(() => {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) {
            try {
                commandHistory = JSON.parse(stored);
            } catch {
                commandHistory = [];
            }
        }
    });

    $effect(() => {
        if (commandHistory) saveHistory();
    });

    type CommandName = 'goto' | 'help' | 'clear';
    const docs: Record<CommandName, { description: string; usage: string; example: string }> = {
        goto: {
            description: 'Navigate to a specific page on the website.',
            usage: 'goto <path>',
            example: 'goto settings'
        },
        help: {
            description: 'Display help information for commands.',
            usage: 'help [command]',
            example: 'help goto'
        },
        clear: {
            description: 'Clear the terminal output.',
            usage: 'clear',
            example: 'clear'
        },
    }

    const directories = [
        { name: 'home', path: '~', children: ['documents', 'downloads'] },
        { name: 'documents', path: '~/documents', files: ['readme.txt'] },
        { name: 'downloads', path: '~/downloads', files: ['not_a_virus.exe', 'image.png'] },
        { name: 'secrets', path: '.secrets' },
    ];

    function parseInput(value: string): { command: string; args: string[] } {
        const parts = value.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        return { command, args };
    }

    const commands = [
        'help', 'clear', 'about', 'hi', 'hey', 'hello', 'goto', 'rm', 'cd', 'pwd',
        'bye', 'exit', 'goodbye', 'ls', 'cat', 'echo', 'date', 'time', 'curl'
    ];
	async function handleSubmit(value: string) {
        // Add to command history if not empty and not duplicate of last
        if (value.trim() && commandHistory[commandHistory.length - 1] !== value) {
            commandHistory.push(value);
        }
        historyIndex = null;

        lines.push({ value, type: 'input' });
        const { command, args } = parseInput(value);
		switch (command.toLowerCase()) {
			case 'help':
                if (args.length > 0) {
                    const cmd = (args[0]?.toLowerCase() ?? 'help') as CommandName;
                    const manual = docs[cmd];
                    if (manual) {
                        lines.push({ value: `Command: ${args[0]}`, type: 'output' });
                        lines.push({ value: `Description: ${manual.description}`, type: 'output' });
                        lines.push({ value: `Usage: ${manual.usage}`, type: 'output' });
                        lines.push({ value: `Example: ${manual.example}`, type: 'output' });
                    } else {
                        lines.push({ value: `No manual entry for '${args[0]}'.`, type: 'output' });
                    }
                } else {
                    lines.push({ value: 'Available commands: help, clear, about, goto', type: 'output' });
                }
				break;
			case 'clear':
				lines.length = 0; // Clear the terminal
				break;
			case 'about':
				lines.push({ value: 'This is ' + pageDescription.toLocaleLowerCase(), type: 'output' });
				break;
            case 'hi':
            case 'hey':
			case 'hello':
				const greetings = ['Hello!', 'Hi there!', 'Greetings!', 'Salutations!', 'Howdy!', 'Hey!'];
				const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
				lines.push({ value: randomGreeting, type: 'output' });
				break;
            case 'goto':
                goto('/' + args.join('/'));
                break;
            case 'rm':
                lines.push({ value: 'Careful now!', type: 'output' });
                break;
            case 'cd':
                if (args.length === 0) {
                    lines.push({ value: 'Please specify a directory to change into.', type: 'output' });
                } else {
                    const dir = directories.find(d => d.name === args[0] || d.path === args[0]);
                    if (!dir) {
                        lines.push({ value: `Directory '${args[0]}' not found.`, type: 'output' });
                        return;
                    }
                    if (dir.path === '~') {
                        currentDirectory = '~';
                    } else {
                        currentDirectory = dir.path;
                    }
                    lines.push({ value: `Changing directory to ${args.join(' ')}`, type: 'output' });
                }
                break;
            case 'pwd':
                lines.push({ value: currentDirectory, type: 'output' });
                break;
            case 'bye':
            case 'exit':
            case 'goodbye':
                lines.push({ value: 'Goodbye! See you next time!', type: 'output' });
                goto('/');
                break;
            case 'ls':
                if ('~' === currentDirectory) {
                    const homeDir = directories.find(d => d.path === '~');
                    homeDir?.children?.forEach(child => {
                        lines.push({ value: child, type: 'output' });
                    });
                } else if (['~/documents', '~/downloads'].includes(currentDirectory)) {
                    const files = directories.find(d => d.path === currentDirectory)?.files || [];
                    files.forEach(file => {
                        lines.push({ value: file, type: 'output' });
                    });
                } else if (currentDirectory === '.secrets') {
                    lines.push({ value: '[hidden]', type: 'output' });
                } else {
                    lines.push({ value: `No such directory: ${currentDirectory}`, type: 'output' });
                }
                break;
            case 'cat':
                if (args.length === 0) {
                    lines.push({ value: 'Please specify a file to read.', type: 'output' });
                } else if (args[0] === 'readme.txt') {
                    lines.push({ value: 'Welcome to muenstererOS!', type: 'output' });
                    lines.push({ value: 'This is a simple terminal interface.', type: 'output' });
                } else if (args[0] === 'not_a_virus.exe') {
                    lines.push({ value: 'Hack the world!', type: 'output' });
                } else {
                    lines.push({ value: `File '${args[0]}' not found.`, type: 'output' });
                }
                break;
            case 'echo':
                if (args.length === 0) {
                    lines.push({ value: 'Please provide a message to echo.', type: 'output' });
                } else {
                    lines.push({ value: args.join(' '), type: 'output' });
                }
                break;
            case 'date':
                const now = new Date();
                lines.push({ value: now.toLocaleString(), type: 'output' });
                break;
            case 'time':
                const time = new Date();
                lines.push({ value: time.toLocaleTimeString(), type: 'output' });
                break;
            case 'history':
                if (commandHistory.length === 0) {
                    lines.push({ value: 'No command history available.', type: 'output' });
                } else if (args.length > 0) {
                    if (args.includes('--clear') || args.includes('-c')) {
                        commandHistory = [];
                        lines.push({ value: 'Command history cleared.', type: 'output' });
                        return;
                    }
                    const index = parseInt(args[0], 10) - 1;
                    if (isNaN(index) || index < 0 || index >= commandHistory.length) {
                        lines.push({ value: `Invalid history index: ${args[0]}`, type: 'output' });
                    } else {
                        lines.push({ value: `Command at index ${index + 1}: ${commandHistory[index]}`, type: 'output' });
                    }
                } else {
                    lines.push({ value: 'Command History:', type: 'output' });
                    commandHistory.forEach((cmd, index) => {
                        lines.push({ value: `${index + 1}: ${cmd}`, type: 'output' });
                    });
                }
                break;
            case 'curl':
                if (args.length === 0) {
                    lines.push({ value: 'Please provide a URL to fetch.', type: 'output' });
                } else {
                    // Allow absolute (http/https) and relative (/api/...) URLs
                    const urlPattern = /^(https?:\/\/[\w.-]+(:[0-9]+)?(\/[\w.-]*)*\/?|\/api\/[\w./-]*)$/;
                    if (!urlPattern.test(args[0])) {
                        lines.push({ value: `Invalid URL: ${args[0]}`, type: 'output' });
                        return;
                    }
                    const response = await fetch(args[0]);
                    if (!response.ok) {
                        lines.push({ value: `Error fetching ${args[0]}: ${response.statusText}`, type: 'output' });
                        return;
                    }
                    const data = await response.text();
                    lines.push({ value: data, type: 'output' });
                }
                break;
			default:
				lines.push({ value: `Unknown command: ${value}`, type: 'output' });
		}
		debugLog('Command submitted:', value);

        if (linesContainer) {
            await tick();
            linesContainer.scrollTop = linesContainer.scrollHeight; // Scroll to the bottom
        }
    }

    async function handleKeyDown(
        event: KeyboardEvent,
        setInput: (value: string) => void,
    ) {
        if (commandHistory.length > 0 && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            handleHistoryNavigation(event, setInput);
            return;
        }

        // Tab completion
        if (event.key === 'Tab') {
            event.preventDefault();
            const currentValue = event.target instanceof HTMLInputElement ? event.target.value : '';
            const { command, args } = parseInput(currentValue);
            const completions = handleCommandCompletion(command, args[args.length - 1] || '');
            if (completions.length >= 1 && args.length > 0) {
                // Single match: autocomplete
                const newInput = currentValue.replace(/(\S+)$/, completions[0]);
                const isSingleCommand = newInput.split(' ').length === 1;
                setInput(newInput + (isSingleCommand ? ' ' : ''));

            } else if (completions.length > 1 && !args.length) {
                // Multiple matches: output options in terminal
                lines.push({ value: completions.join(' '), type: 'output' });
                if (linesContainer) {
                    await tick();
                    linesContainer.scrollTop = linesContainer.scrollHeight; // Scroll to the bottom
                }
            }
        }
        if (event.ctrlKey && event.key.toLowerCase() === 'c') {
            setInput(''); // Clear input on Ctrl+C
            event.preventDefault();
            return;
        }
    }

    // Handle up/down arrow for command history navigation
    function handleHistoryNavigation(event: KeyboardEvent, setInput: (v: string) => void) {
        if (commandHistory.length === 0) return;

        if (event.key === 'ArrowUp') {
            if (historyIndex === null) {
                historyIndex = commandHistory.length - 1;
            } else if (historyIndex > 0) {
                historyIndex--;
            }
            setInput(commandHistory[historyIndex]);
            event.preventDefault();
        } else if (event.key === 'ArrowDown') {
            if (historyIndex === null) return;
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                setInput(commandHistory[historyIndex]);
            } else {
                historyIndex = null;
                setInput('');
            }
            event.preventDefault();
        }
    }

    function handleCommandCompletion(command: string, query: string): string[] {
        switch (command) {
            case 'goto':
            case 'cd':
                return directories.map(dir => dir.name).filter(name => name.startsWith(query || ''));
            case 'cat':
                return ['readme.txt', 'not_a_virus.exe'].filter(file => file.startsWith(query || ''));
            case 'curl':
                return endpoints.map(endpoint => endpoint.url).filter(url => url.startsWith(query || ''));
            case 'help':
                return Object.keys(docs).filter(cmd => cmd.startsWith(query || ''));
            default:
                const commandCompletions = commands.filter(cmd => cmd.startsWith(command));
                if (commandCompletions.length > 0) {
                    return commandCompletions;
                }
        }
        return [];
        
    }
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<div class="container">
	<Heading>{pageTitle}</Heading>
	<Terminal.Root class="max-w-2xl" delay={100}>
		{#if !isIntroComplete}
			<Terminal.Loading delay={100} oncomplete={() => (isIntroComplete = true)} completeDelay={700}>
				{#snippet loadingMessage()}
					init muenstererOS
				{/snippet}
				{#snippet completeMessage()}
					<span class="text-green-500"> ✔ CLI ready </span>
				{/snippet}
			</Terminal.Loading>
		{:else}
			<div
				class="mb-1 flex max-h-40 flex-col gap-1 overflow-y-auto overflow-x-clip md:max-h-80"
				bind:this={linesContainer}
			>
				{#each lines as line}
					<span>
						{#if line.type === 'input'}
							&gt;
						{/if}
						{line.value}
					</span>
				{/each}
			</div>
			<Terminal.Input
				placeholder="Type your command..."
				prompt="muenstererOS %"
				onsubmit={handleSubmit}
				onkeydown={handleKeyDown}
			/>
		{/if}
	</Terminal.Root>
</div>
