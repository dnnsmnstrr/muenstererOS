<script module lang="ts">
	type CommandData = {
		name: string;
		value?: string;
		icon?: ConstructorOfATypedSvelteComponent;
		url?: string;
		action?: () => void;
	};
</script>

<script lang="ts">
	import { run } from 'svelte/legacy';

	import {
		Home,
		User,
		Settings,
		Bug,
		BugOff,
		PartyPopper,
		Pipette,
		Sun,
		Moon,
		Instagram,
		Palette,
		ArrowRight,
		ArrowLeft,
		Music,
		Send,
		Linkedin,
		Twitter,
		Shapes,
		Keyboard,
		ScrollText,
		Search,
		Signpost,
		Github,
		LayoutGrid,
		ListMusic,
		Monitor
	} from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Dialog from '$lib/components/ui/dialog';
	import { mode, toggleMode } from 'mode-watcher';
	import { onMount } from 'svelte';
	import {
		isCommandActive,
		debug,
		debugLog,
		primaryColor,
		backgroundColor,
		resetColors,
		showHelp,
		modifiedColors,
	} from '$lib/stores/app';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { capitalize, hexToHsl } from '$lib/helper';
	import {
		isMobile,
		reloadPage,
		scrollToBottom,
		scrollToTop,
		toggleFullscreen
	} from '$lib/browser';
	import { confettiAction, eyeDropperAction } from '@sveltelegos-blue/svelte-legos';
	import { toast } from 'svelte-sonner';
	import confetti from 'canvas-confetti';
	import List from '$lib/components/typography/List.svelte';
	import Kbd from '$lib/components/typography/Kbd.svelte';
	import { page } from '$app/state';
	import { links } from '$lib/config';
	import { PUBLIC_ALGOLIA_APP_ID, PUBLIC_ALGOLIA_API_KEY } from '$env/static/public';
	import docsearch from '@docsearch/js';
	import '@docsearch/css';

	let loading = false;
	let query = $state('');
	let lastKey = '';

	const keyboardShortcuts = [
		{ key: '?', description: 'Open this help dialog' },
		{ key: 'esc', description: 'Close open dialog' },
		{ key: '/', description: 'Search Zettelkasten with Algolia' },
		{ key: ['⌘', ','], description: 'Go to settings' },
		{ key: ['⌘', 'F'], description: 'Fullscreen' },
		{ key: ['⌘', 'P'], description: 'Print' }
	];
	const gotoShortcuts: Record<string, string> = {
		a: '/about',
		i: '/legal', // impressum
		l: '/legal',
		p: '/projects',
		h: '/', // home
		r: '/redirects',
		s: '/settings',
		u: '/uses'
	};
	const konamiCode = [
		'ArrowUp',
		'ArrowUp',
		'ArrowDown',
		'ArrowDown',
		'ArrowLeft',
		'ArrowRight',
		'ArrowLeft',
		'ArrowRight',
		'b',
		'a'
	];
	let konamiIndex = 0;

	function handleKeydown(e: KeyboardEvent) {
		if ($debug) {
			console.log(e);
		}
		const ignoredKeys = ['Dead', 'Backspace', 'c', 'v', 'a'];
		if (!ignoredKeys.includes(e.key) && (e.ctrlKey || e.metaKey)) {
			debugLog('Preventing default behavior for key: ' + e.key);
			e.preventDefault();
		}
		if (e.key !== 'Escape' && e.key !== '/') {
			e.stopImmediatePropagation();
		}

		if (document.querySelector('.DocSearch-Modal')) {
			console.log('DocSearch-Modal')
			return;
		}

		// konami easter egg https://en.wikipedia.org/wiki/Konami_Code
		if (e.key === konamiCode[konamiIndex]) {
			konamiIndex += 1;
		} else {
			konamiIndex = 0;
		}
		if (konamiIndex === konamiCode.length) {
			debugLog("That's what I call a Pro Gamer Move!");
			var defaults = {
				spread: 360,
				ticks: 50,
				gravity: 0,
				decay: 0.94,
				startVelocity: 30,
				colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
			};

			function shoot() {
				confetti({
					...defaults,
					particleCount: 40,
					scalar: 1.2,
					shapes: ['star']
				});

				confetti({
					...defaults,
					particleCount: 10,
					scalar: 0.75,
					shapes: ['circle']
				});
			}
			setTimeout(shoot, 0);
			setTimeout(shoot, 150);
			setTimeout(shoot, 300);
			setTimeout(shoot, 450);
			setTimeout(shoot, 600);

			toast.success('Achievement Unlocked: Konami Code', {
				description: "Congratulations, you're a nerd!"
			});
		}

		// meta
		if (e.metaKey || e.ctrlKey) {
			switch (e.key) {
				case ',':
					goto('/settings');
					break;
				case 'f':
					toggleFullscreen();
					break;
				case 'k':
					$isCommandActive = !$isCommandActive;
					break;
				case 'm':
					toggleMode();
					break;
				case 'r':
					reloadPage();
					break;
				default:
					break;
			}
		}

		// shortcuts
		const noFocusedElement = document.activeElement === document.body;
		if (e.shiftKey && noFocusedElement) {
			switch (e.key) {
				case '?':
					$showHelp = !$showHelp;
					debugLog($showHelp ? 'Showing' : 'Closing', 'help dialog...');
					break;
				case '@':
					window.location.href = links.mailto;
					break;
				default:
					break;
			}
		}
		if (lastKey === 'g' && noFocusedElement) {
			switch (e.key) {
				case 'b':
					scrollToBottom();
					break;
				case 't':
					scrollToTop();
					break;
				default:
					if (gotoShortcuts[e.key]) {
						goto(gotoShortcuts[e.key]);
					}
			}
		}
		if (lastKey === 'd' && e.key === 'm' && noFocusedElement) {
			toggleMode();
		}
		if (e.key === 'Escape' && $isCommandActive) {
			$isCommandActive = false;
		}
		const isOverlayVisible = $isCommandActive || $showHelp;
		if (['Escape', '/'].includes(e.key) && isOverlayVisible) {
			$showHelp = false;
		}
		
    	const pagesWithSearchField = ['/redirects', '/playlists'] // immediately search on these pages
		if (pagesWithSearchField.includes(page.url.pathname) && !isOverlayVisible && !['Enter', 'Tab', 'Escape'].includes(e.key)) {
			const input = document.querySelector('input');
			if (input && input.focus) {
				input.focus();
			}
		}
		if (e.key === 'Escape' && document.activeElement instanceof HTMLInputElement) {
			const inputElement = document.activeElement as HTMLInputElement;
			if (inputElement.value === '') {
				inputElement.blur();
			}
		}
		lastKey = e.key;
	}

	function initDocsearch() {
		docsearch({
			container: '#docsearch',
			appId: PUBLIC_ALGOLIA_APP_ID,
			apiKey: PUBLIC_ALGOLIA_API_KEY,
			indexName: 'dnnsmnstrr-gitlab',
			placeholder: 'Search Zettelkasten',
			insights: true,
			navigator: {
				// https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/keyboard-navigation/
				navigate({ itemUrl }) {
					const windowReference = window.open(itemUrl, '_blank', 'noopener');
					if (windowReference) {
						windowReference.focus();
					}
				},
				navigateNewTab({ itemUrl }) {
					window.location.assign(itemUrl); // switched this from the default navigate function
				}
			}
		});
	}
	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		initDocsearch();
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	const loadingProgress = Tween.of(() => 0, {
		duration: 1000,
		easing: cubicInOut
	});

	$effect(() => {
		loadingProgress.set(loading ? 100 : 0);
	});

	$effect(() => {
		console.log($isCommandActive, query);
	});

	const ALIAS_SEPARATOR = '::';
	const enrichLink = (link: CommandData & { aliases?: string }): CommandData => {
		const action =
			link.action ||
			function () {
				if (!link.url) {
					return debugLog('Cannot open link for ' + link.name);
				}
				debugLog(`Opening link to ${link.name} (${link.url})`);
				if (link.url.startsWith('/')) {
					goto(link.url);
					// window.location.href = link.url
				} else {
					window.open(link.url);
				}
			};
		let value = link.value || link.name;
		if (link.aliases) {
			value += ALIAS_SEPARATOR + link.aliases;
		}
		return {
			...link,
			action,
			value
		};
	};

	const externalLinks: CommandData[] = [
		{ name: 'GitHub', icon: Github, url: links.github },
		{ name: 'Instagram', icon: Instagram, url: links.instagram },
		{ name: 'Spotify', aliases: 'music playlists', icon: Music, url: links.spotify },
		{ name: 'Telegram', aliases: 'messages chats', icon: Send, url: links.telegram },
		{ name: 'LinkedIn', aliases: 'work professional', icon: Linkedin, url: links.linkedin },
		{ name: 'Twitter / 𝕏', icon: Twitter, url: links.x },
		{ name: 'CV', aliases: 'resume curriculum vitae', icon: ScrollText, url: links.cv }
	].map(enrichLink);

	function toggleDebug() {
		$debug = !$debug;
		$isCommandActive = false;
	}

	function handleDocsearch() {
		try {
			debugLog('Intializing Algolia DocSearch...');
			const docSearchButton = document.querySelector(
				'.DocSearch.DocSearch-Button'
			) as HTMLButtonElement;
			if (docSearchButton && docSearchButton.click) {
				docSearchButton.click();
			}
			$isCommandActive = false;
		} catch (error) {
			console.log('error', error);
		}
	}
	let commandConfig = $derived({
		navigation: [
			{ name: 'Home', icon: Home, url: '/' },
			{ name: 'About', icon: User, url: '/about' },
			{ name: 'Playground', icon: Shapes, url: '/playground' },
			{ name: 'Redirects', icon: Signpost, url: '/redirects' },
			{ name: 'Projects', icon: LayoutGrid, url: '/projects' },
			{ name: 'Playlists', icon: ListMusic, url: '/playlists' },
			{ name: 'Uses', icon: Monitor, url: '/uses' },
			{
				name: 'Search Zettelkasten',
				aliases: 'search notes find information knowledge second brain',
				icon: Search,
				action: handleDocsearch
			},
			{ name: 'Settings', aliases: 'configuration setup', icon: Settings, url: '/settings' },
			{
				name: 'Keyboard Shortcuts',
				aliases: 'keyboard shortcuts help assistance hotkeys',
				icon: Keyboard,
				action: () => {
					$showHelp = true;
					$isCommandActive = false;
				}
			},
			{ name: 'Go Forward', icon: ArrowRight, action: () => window.history.forward() },
			{ name: 'Go Back', icon: ArrowLeft, action: () => window.history.back() },
			{ name: 'Reload', icon: ArrowLeft, action: reloadPage }
		]
			.filter((link) => page.url.pathname !== link.url)
			.map(enrichLink),
		links: externalLinks,
		system: [
			{
				name: 'Toggle Dark Mode',
				value: 'theme',
				icon: $mode === 'light' ? Sun : Moon,
				action: toggleMode
			},
			{
				name: ($debug ? 'Disable' : 'Enable') + ' Debug Mode',
				icon: $debug ? BugOff : Bug,
				action: toggleDebug
			}
		]
	} as Record<string, CommandData[]>);
</script>

<Command.Dialog bind:open={$isCommandActive}>
	<Command.Input bind:value={query} placeholder="Type a command or search..." class="text-base" />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		{#each Object.entries(commandConfig) as [group, commands]}
			<Command.Group heading={capitalize(group)}>
				{#each commands as command}
					<Command.Item onSelect={command.action} value={command.value}>
						{#if command.icon}
							<command.icon class="mr-2" />
						{/if}
						{command.name}
					</Command.Item>
				{/each}
			</Command.Group>
		{/each}
		<Command.Group heading="Settings">
			{#if !isMobile.any() && (!query || 'pick primary color pick background color'.includes(query))}
				<button
					use:eyeDropperAction={{
						onDone: (color) => {
							const message = 'Picked color: ' + color;
							debugLog(message);
							$primaryColor = hexToHsl(color);
							toast.success(message, {
								description: 'Click to copy to clipboard',
								action: {
									label: 'Copy',
									onClick: () => navigator.clipboard.writeText(color)
								}
							});
						},
						onError: console.error
					}}
					class="w-full"
				>
					<Command.Item>
						<Pipette class="mr-2" />
						Pick primary color
					</Command.Item>
				</button>
				<button
					use:eyeDropperAction={{
						onDone: (color) => {
							const message = 'Picked color: ' + color;
							debugLog(message);
							$backgroundColor = hexToHsl(color);
							toast.success(message, {
								description: 'Click to copy to clipboard',
								action: {
									label: 'Copy',
									onClick: () => navigator.clipboard.writeText(color)
								}
							});
						},
						onError: console.error
					}}
					class="w-full"
				>
					<Command.Item>
						<Pipette class="mr-2" />
						Pick background color
					</Command.Item>
				</button>
			{/if}
			{#if $modifiedColors}
				<Command.Item onSelect={resetColors}>
					<Palette class="mr-2" />
					Reset theme colors
				</Command.Item>
			{/if}
		</Command.Group>
		<Command.Group heading="Fun">
			<button use:confettiAction class="w-full">
				<Command.Item value="confetti::party popper celebrate celebration">
					<PartyPopper class="mr-2" />
					Confetti
				</Command.Item>
			</button>
		</Command.Group>
	</Command.List>
	<Command.Loading class="h-1">
		{#if loading}
			<Progress value={loadingProgress.current} class="h-1" />
		{/if}
	</Command.Loading>
</Command.Dialog>

<Dialog.Root open={$showHelp} onOpenChange={(value) => ($showHelp = value)}>
	<Dialog.Content showClose>
		<Dialog.Header>
			<Dialog.Title>Keyboard Shortcuts</Dialog.Title>
			<Dialog.Description>
				There are many different shortcuts and features to explore on this page. Here is a selection
				of the most obvious ones:
			</Dialog.Description>
		</Dialog.Header>
		<List class="space-y-4">
			{#each keyboardShortcuts as shortcut}
				<li class="flex">
					<div class="min-w-20">
						{#if Array.isArray(shortcut.key)}
							{#each shortcut.key as singleKey, index}
								<Kbd>{singleKey}</Kbd>
								{#if index < shortcut.key.length - 1}
									<span class="pr-1">+</span>
								{/if}
							{/each}
						{:else}
							<Kbd>{shortcut.key}</Kbd>
						{/if}
					</div>
					{shortcut.description}
				</li>
			{/each}
		</List>
	</Dialog.Content>
</Dialog.Root>

<div class="hidden" id="docsearch"></div>
