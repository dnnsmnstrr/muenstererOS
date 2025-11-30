<script module lang="ts">
	type CommandData = {
		name: string;
		keywords?: string[];
		value?: string;
		icon?: ConstructorOfATypedSvelteComponent;
		href?: string;
		action?: () => void;
	};
</script>

<script lang="ts">
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
		Keyboard,
		ScrollText,
		Search,
		Github,
		Link,
		RotateCcw,
		Monitor,
		Eye,
		Plus
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
		modifiedColors
	} from '$lib/stores/app';
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import {
		capitalize,
		hexToHsl,
		isMobile,
		reloadPage,
		scrollToBottom,
		scrollToTop,
		toggleFullscreen
	} from '$lib/utils/index';
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
	import type { BookmarkItem } from './Menu.svelte';
	import { resetDesktopFiles, dvdBounceActive, desktopFiles, restoreAllHiddenFiles, addFileToDesktop } from '$lib/stores/desktop';

	interface Props {
		pages?: BookmarkItem[];
	}

	let { pages = [] }: Props = $props();
	
	let loading = false;
	let query = $state('');
	let lastKey = '';

	const keyboardShortcuts = [
		{ key: '?', description: 'Open this help dialog' },
		{ key: 'esc', description: 'Close open dialog' },
		{ key: '/', description: 'Search Zettelkasten with Algolia' },
		{ key: ['⌘', ','], description: 'Go to settings' },
		{ key: ['⌘', 'F'], description: 'Fullscreen' },
		{ key: ['⌘', 'K'], description: 'Command Palette' },
	];

	const gotoShortcuts: Record<string, string> = {
		a: '/about',
		e: '/experiment',
		i: '/legal', // impressum
		l: '/legal',
		p: '/projects',
		h: '/', // home
		n: '/now',
		r: '/redirects',
		s: '/settings',
		t: '/terminal',
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
		if ($debug) console.log(e);
		if (
			((e.metaKey && e.altKey) || (e.ctrlKey && e.altKey)) &&
			(e.code === 'KeyI' || e.key.toLowerCase() === 'i')
		) return; // Allow dev tools to open (Cmd+Opt+I on Mac, Ctrl+Alt+I on Windows)
		const allowedHotkeys = ['r', 'p'];
		if (allowedHotkeys.includes(e.key) && (e.metaKey || e.ctrlKey)) {
			debugLog('allowed hotkey pressed:', e.key);
			return;
		}
		
		const ignoredPages = ['/hotkeys'];
		if (ignoredPages.includes(page.url.pathname)) {
			debugLog('ignoring keydown event in command handler on page:', page.url.pathname);
			return;
		}
		const ignoredKeys = ['Dead', 'Backspace', 'c', 'v', 'a', 'i', 'x'];
		if (!ignoredKeys.includes(e.key) && (e.ctrlKey || e.metaKey || e.metaKey)) {
			debugLog('Preventing default behavior for key: ' + e.key);
			e.preventDefault();
		}
		if (e.key !== 'Escape' && e.key !== '/') {
			// fix modals conflicting
			e.stopImmediatePropagation();
		}

		if (document.querySelector('.DocSearch-Modal')) {
			console.log('DocSearch-Modal is open, ignoring keydown event');
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
				case '.':
					if (e.shiftKey) {
						toggleDebug();
					} else {
						$isCommandActive = !$isCommandActive;
					}
					break;
				case ',':
					goto(e.shiftKey ? '/admin' : '/settings');
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

		const pagesWithSearchField = ['/redirects', '/uses', '/playlists', '/terminal']; // immediately search on these pages
		if (
			pagesWithSearchField.includes(page.url.pathname) &&
			!isOverlayVisible &&
			!['Enter', 'Tab', 'Escape'].includes(e.key)
		) {
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

	const enrichLink = (link: CommandData): CommandData => {
		let href = link.href || '';
		if (!link.href && !link.action) {
			href = '/' + link.name.toLowerCase();
		}
		const action =
			link.action ||
			function () {
				debugLog(`Opening link to ${link.name}${href ? ' at ' + href : ''}`);
				if (!href && !href) {
					return goto(link.name.toLowerCase());
				}
				if (href && href.startsWith('/')) {
					goto(href);
				} else {
					window.open(href);
				}
			};
		let value = link.value || link.name;
		return {
			...link,
			href,
			action,
			value
		};
	};

	const externalLinks: CommandData[] = [
		{ name: 'GitHub', keywords: ['code'], icon: Github, href: links.github },
		{ name: 'Instagram', keywords: ['meta'], icon: Instagram, href: links.instagram },
		{ name: 'Spotify', keywords: ['music', 'playlists'], icon: Music, href: links.spotify },
		{ name: 'Telegram', keywords: ['messages', 'chats'], icon: Send, href: links.telegram },
		{ name: 'LinkedIn', keywords: ['work', 'professional'], icon: Linkedin, href: links.linkedin },
		{ name: 'Twitter / 𝕏', keywords: ['X'], icon: Twitter, href: links.x },
		{ name: 'CV', keywords: ['resume', 'curriculum vitae'], icon: ScrollText, href: links.cv }
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
			{ name: 'Home', icon: Home, href: '/' },
			{ name: 'About', icon: User, href: '/about' },
			...pages,
			{
				name: 'Search Zettelkasten',
				keywords: ['algolia', 'search', 'notes', 'knowledge', 'second brain'],
				icon: Search,
				action: handleDocsearch
			},
			{ name: 'Settings', keywords: ['preferences'], icon: Settings, href: '/settings' },
			{
				name: 'Keyboard Shortcuts',
				keywords: ['help', 'hotkeys'],
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
		.map(enrichLink)
		.filter((link) => {
			// remove current page from navigation
			return page.url.pathname !== link.href;
		}),
		links: externalLinks,
		system: [
			{
				name: 'Toggle Dark Mode',
				value: 'toggle dark mode, theme',
				icon: $mode === 'light' ? Sun : Moon,
				action: toggleMode
			},
			{
				name: ($debug ? 'Disable' : 'Enable') + ' Debug Mode',
				icon: $debug ? BugOff : Bug,
				action: toggleDebug
			},
			{
				name: 'Reset Desktop Files',
				value: 'reset desktop files, restore file positions, clear desktop',
				icon: RotateCcw,
				action: () => {
					resetDesktopFiles();
					toast.success('Desktop restored to default.');
					$isCommandActive = false;
				}
			},
			...(() => {
				// Only show "Create Desktop Shortcut" if current page has a bookmark entry
				const currentPage = pages.find(p => p.href === page.url.pathname || p.name.toLowerCase() === page.url.pathname.replace(/^\//, ''));
				if (!currentPage || page.url.pathname === '/') return [];
				
				return [{
					name: 'Create Desktop Shortcut',
					value: 'create desktop shortcut, add to desktop, pin to desktop',
					keywords: ['shortcut', 'desktop', 'add', 'pin', 'create'],
					icon: Plus,
					action: () => {
						const fileId = currentPage.name.toLocaleLowerCase() || currentPage.href?.replace(/\//g, '') || 'page';
						const existingFile = $desktopFiles.find(f => f.id === fileId);
						console.log(currentPage)
						if (existingFile && !existingFile.hidden) {
							toast.info('Shortcut already exists on desktop');
						} else {
							addFileToDesktop({
								id: fileId,
								name: currentPage.name,
								href: currentPage.href || '/' + currentPage.name.toLowerCase(),
								icon: currentPage.icon
							});
							toast.success(`Added "${currentPage.name}" to desktop`);
						}
						$isCommandActive = false;
					}
				}];
			})()
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
					<Command.Item onSelect={command.action} value={command.value} keywords={command.keywords}>
						{#if command.icon}
							<command.icon class="mr-2" />
						{/if}
						{command.name}
					</Command.Item>
				{/each}
				{#if group === 'links'}
					{#each Object.entries(links).map(([name, href]) => enrichLink({ name, href })) as command}
						<Command.Item onSelect={command.action} value={command.value} keywords={command.keywords}>
							<Link class="mr-2" />
							{capitalize(command.name)}
						</Command.Item>
					{/each}
				{/if}
			</Command.Group>
		{/each}
		<Command.Group heading="Settings">
			{#if !isMobile.any()}
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
					<Command.Item keywords={['theme']}>
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
					<Command.Item keywords={['theme']}>
						<Pipette class="mr-2" />
						Pick background color
					</Command.Item>
				</button>
			{/if}
			{#if $modifiedColors}
				<Command.Item onSelect={resetColors} keywords={['theme']}>
					<Palette class="mr-2" />
					Reset theme colors
				</Command.Item>
			{/if}
		</Command.Group>
		<Command.Group heading="Fun">
			<button use:confettiAction class="w-full">
				<Command.Item value="confetti" keywords={['party', 'celebrate']}>
					<PartyPopper class="mr-2" />
					Confetti
				</Command.Item>
			</button>
			{#if page.url.pathname === '/'}
				<Command.Item
					onSelect={() => {
						$dvdBounceActive = !$dvdBounceActive;
						$isCommandActive = false;
					}}
					value="dvd bounce"
					keywords={['easter egg', 'screen saver']}
				>
					<Monitor class="mr-2" />
					{ $dvdBounceActive ? 'Disable' : 'Enable' } DVD Bounce
				</Command.Item>
			{/if}
		</Command.Group>
	</Command.List>
</Command.Dialog>

<Dialog.Root open={$showHelp} onOpenChange={(value) => ($showHelp = value)}>
	<Dialog.Content>
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
