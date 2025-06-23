<script lang="ts" module>
	type Line = { value: string; type?: 'input' | 'output' };
</script>

<script lang="ts">
	import { goto } from '$app/navigation';

	import Heading from '$lib/components/typography/Heading.svelte';
	import * as Terminal from '$lib/components/ui/terminal';

	const pageTitle = 'Terminal';
	const pageDescription = 'A command line interface for the muenstererOS website.';
	const lines = $state<Line[]>([]);
    let currentDirectory = $state<string>('~');
	let isIntroComplete = $state(false);

    const docs = {
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
        { name: 'documents', path: '~/documents' },
        { name: 'downloads', path: '~/downloads' },
        { name: 'secrets', path: '.secrets' },
    ];

	function handleInput(value: string) {
		lines.push({ value, type: 'input' });
        const [rootCommand, ...args] = value.split(' ');
		switch (rootCommand.toLowerCase()) {
			case 'help':
                if (args.length > 0) {
                    const manual = docs[args[0].toLowerCase() || 'help'];
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
                if (currentDirectory === '~') {
                    lines.push({ value: 'documents/', type: 'output' });
                    lines.push({ value: 'downloads/', type: 'output' });
                } else if (currentDirectory === '~/documents') {
                    lines.push({ value: 'readme.txt', type: 'output' });
                } else if (currentDirectory === '~/downloads') {
                    lines.push({ value: 'not_a_virus.exe', type: 'output' });
                    lines.push({ value: 'image.png', type: 'output' });
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
			default:
				lines.push({ value: `Unknown command: ${value}`, type: 'output' });
		}
		console.log('Command submitted:', value);
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
			<div class="mb-1 flex flex-col gap-1">
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
				onsubmit={handleInput}
			/>
		{/if}
	</Terminal.Root>
</div>
