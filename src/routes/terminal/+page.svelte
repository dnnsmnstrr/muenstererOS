<script lang="ts" module>
	type Line = { value: string; type?: 'input' | 'output' };
    type TerminalCommand = {
        name: string;
        description: string;
        usage: string;
        example?: string;
        aliases?: string[];
        hidden?: boolean;
        callback: (args: { args: string[]; lines: Line[] }) => Promise<void>;
    };
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
    import { tick } from 'svelte';
    import { onMount } from 'svelte';

	import Heading from '$lib/components/typography/Heading.svelte';
	import * as Terminal from '$lib/components/ui/terminal';
	import { debugLog } from '$lib/stores/app';
	import { endpoints } from '../api/+page.svelte';
	import pagesData from '../../data/pages.json?raw';
    type Page = {
		date: string;
		title: string;
		path?: string;
	};
	const pages = JSON.parse(pagesData) as Page[];

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

    const commands: TerminalCommand[] = [
        {
            name: 'help',
            description: 'Display help information for commands.',
            aliases: ['h', '?'],
            usage: 'help [command]',
            example: 'help goto',
            callback: async ({ args, lines }) => {
                if (args.length > 0) {
                    const cmd = args[0]?.toLowerCase();
                    const found = commands.find(c => c.name === cmd);
                    if (found) {
                        lines.push({ value: `Command: ${found.name}`, type: 'output' });
                        lines.push({ value: `Description: ${found.description}`, type: 'output' });
                        lines.push({ value: `Usage: ${found.usage}`, type: 'output' });
                        if (found.example) {
                            lines.push({ value: `Example: ${found.example}`, type: 'output' });
                        }
                    } else {
                        lines.push({ value: `No manual entry for '${args[0]}'.`, type: 'output' });
                    }
                } else {
                    lines.push({ value: 'Available commands: ' + commands.map(c => c.name).join(', '), type: 'output' });
                }
            }
        },
        {
            name: 'clear',
            description: 'Clear the terminal output.',
            usage: 'clear',
            callback: async ({ lines }) => {
                lines.length = 0;
            }
        },
        {
            name: 'about',
            description: 'Show information about the terminal.',
            usage: 'about',
            callback: async ({ lines }) => {
                lines.push({ value: 'This is a command line interface for the muenstererOS website.', type: 'output' });
            }
        },
        {
            name: 'hello',
            description: 'Say hello.',
            aliases: ['hello', 'hey', 'hi', 'yo', 'test'],
            usage: 'hello',
            callback: async ({ lines }) => {
                const greetings = ['Hello!', 'Hi there!', 'Greetings!', 'Salutations!', 'Howdy!', 'Hey!', 'What\'s up?', 'Welcome!'];
                const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
                lines.push({ value: randomGreeting, type: 'output' });
            }
        },
        {
            name: 'goto',
            description: 'Navigate to a specific page on the website.',
            usage: 'goto <path>',
            example: 'goto settings',
            callback: async ({ args }) => {
                const path = args.join('/');
                if (path.startsWith('/')) {
                    goto(path);
                } else if (path.startsWith('http://') || path.startsWith('https://')) {
                    window.open(path, '_blank');
                } else {
                    goto('/' + path);
                }
            }
        },
        {
            name: 'rm',
            description: 'Warn about removing files.',
            usage: 'rm <file>',
            example: 'rm not_a_virus.exe',
            callback: async ({ lines }) => {
                lines.push({ value: 'Careful now!', type: 'output' });
            }
        },
        {
            name: 'cd',
            description: 'Change directory.',
            usage: 'cd <directory>',
            example: 'cd documents',
            callback: async ({ args, lines }) => {
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
            }
        },
        {
            name: 'pwd',
            description: 'Print working directory.',
            usage: 'pwd',
            callback: async ({ lines }) => {
                lines.push({ value: currentDirectory, type: 'output' });
            }
        },
        {
            name: 'exit',
            description: 'Exit the terminal.',
            aliases: ['quit', 'bye', 'goodbye'],
            usage: 'exit',
            callback: async ({ lines }) => {
                lines.push({ value: 'Goodbye! See you next time!', type: 'output' });
                goto('/');
            }
        },
        {
            name: 'ls',
            description: 'List files and directories.',
            usage: 'ls',
            example: 'ls',
            callback: async ({ lines }) => {
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
            }
        },
        {
            name: 'cat',
            description: 'Read a file.',
            usage: 'cat <file>',
            example: 'cat readme.txt',
            callback: async ({ args, lines }) => {
                if (args.length === 0) {
                    lines.push({ value: 'Please specify a file to read.', type: 'output' });
                } else if (args[0] === 'readme.txt') {
                    lines.push({ value: 'Welcome to the muenstererOS terminal!', type: 'output' });
                    lines.push({ value: 'You seem to know what you\'re doing. Carry on...', type: 'output' });
                    lines.push({ value: '', type: 'output' });
                } else if (args[0] === 'not_a_virus.exe') {
                    lines.push({ value: 'Hack the world!', type: 'output' });
                } else {
                    lines.push({ value: `File '${args[0]}' not found.`, type: 'output' });
                }
            }
        },
        {
            name: 'echo',
            description: 'Echo a message.',
            usage: 'echo <message>',
            example: 'echo Hello world!',
            callback: async ({ args, lines }) => {
                if (args.length === 0) {
                    lines.push({ value: 'Please provide a message to echo.', type: 'output' });
                } else {
                    lines.push({ value: args.join(' '), type: 'output' });
                }
            }
        },
        {
            name: 'date',
            description: 'Show the current date and time.',
            usage: 'date',
            example: 'date',
            callback: async ({ lines }) => {
                const now = new Date();
                lines.push({ value: now.toLocaleString(), type: 'output' });
            }
        },
        {
            name: 'time',
            description: 'Show the current time.',
            usage: 'time',
            example: 'time',
            callback: async ({ lines }) => {
                const time = new Date();
                lines.push({ value: time.toLocaleTimeString(), type: 'output' });
            }
        },
        {
            name: 'history',
            description: 'Show command history.',
            usage: 'history',
            example: 'history',
            callback: async ({ args, lines }) => {
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
            }
        },
        {
            name: 'curl',
            description: 'Fetch a URL.',
            usage: 'curl <url>',
            example: 'curl /api/hello',
            callback: async ({ args, lines }) => {
                if (args.length === 0) {
                    lines.push({ value: 'Please provide a URL to fetch.', type: 'output' });
                } else {
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
            }
        }
    ];

	async function handleSubmit(value: string) {
        // Add to command history if not empty and not duplicate of last
        if (value.trim() && commandHistory[commandHistory.length - 1] !== value) {
            commandHistory.push(value);
        }
        historyIndex = null;

        lines.push({ value, type: 'input' });
        const { command, args } = parseInput(value);
        const foundCommand = commands.find(c => c.name === command || (c.aliases && c.aliases.includes(command)));
        if (foundCommand) {
            try {
                await foundCommand.callback({ args, lines });
            } catch (error) {
                lines.push({ value: `Error executing command '${command}': ${error}`, type: 'output' });
            }
        } else {
            lines.push({ value: `Unknown command: ${command}`, type: 'output' });
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
                return pages.map(page => page.path || page.title.toLocaleLowerCase()).filter(page => page.startsWith(query.toLowerCase()))  
            case 'cd':
                return directories.map(dir => dir.name).filter(name => name.startsWith(query || ''));
            case 'cat':
                return ['readme.txt', 'not_a_virus.exe'].filter(file => file.startsWith(query || ''));
            case 'curl':
                return endpoints.map(endpoint => endpoint.url).filter(url => url.startsWith(query || ''));
            case 'help':
                return commands
                    .filter(cmd => !cmd.hidden)
                    .map(cmd => cmd.name)
                    .filter(name => name.startsWith(query || ''));
            default:
                const commandCompletions = commands.filter(cmd => cmd.name.startsWith(command));
                if (commandCompletions.length > 0) {
                    return commandCompletions.map(cmd => cmd.name);
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
