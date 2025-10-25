<script lang="ts">
    import { onDestroy } from 'svelte';
	import { Heading, Link, Kbd } from '$lib/components/typography';
	import * as Card from '$lib/components/ui/card';
	import { Command } from 'lucide-svelte';
	import VirtualKeyboard, { Modifier, normalizeEventKey, SpecialChar, type Shortcut } from './VirtualKeyboard.svelte';
	import Raycast from '$lib/components/icons/raycast.svg';
	import { getRedirectByName } from '$lib/redirects';
	import { Button } from '$lib/components/ui/button';
	const raycastUrl = getRedirectByName('raycast')?.url;

	// Raycast shortcuts configuration
	const hyperKeys = '⌘⌥⌃⇧';
	const shortcuts: Shortcut[] = [
		{
			modifier: Modifier.Ctrl,
			key: 'Space',
			description: 'I use Ctrl as modifier to keep Spotlight available as well',
			action: 'Raycast Launcher',
			icon: '🚀'
		},
		{
			key: 'Caps',
			description: `Capslock is rarely needed, so it is remapped to all modifier keys at once (${hyperKeys})`,
			action: 'Hyper Key',
			icon: Modifier.Hyper
		},
		{
			modifier: Modifier.Hyper,
			key: 'c',
			description: 'Open Clipboard Manager',
			action: 'Clipboard Manager',
			icon: '📋'
		},
		{
			modifier: Modifier.Hyper,
			key: 'v',
			description: 'Open the Raycast Snippets view',
			action: 'Snippets',
			icon: '📝'
		},
		{
			modifier: Modifier.Hyper,
			key: 'b',
			description: 'Open Bitwarden (Quick Access to passwords)',
			action: 'Bitwarden',
			icon: '🔒'
		},
		{
			modifier: Modifier.Hyper,
			key: 'd',
			description: 'Open Downloads in Finder',
			action: 'Downloads',
			icon: '📥'
		},
		{
			modifier: Modifier.Hyper,
			key: 'e',
			description: 'Show current IDE window',
			action: 'Editor',
			icon: '⌨️'
		},
		{
			modifier: Modifier.Hyper,
			key: 'f',
			description: 'Open current Finder window',
			action: 'Finder',
			icon: '📁'
		},
		{
			modifier: Modifier.Hyper,
			key: 'g',
			description: 'Search selected text with Google',
			action: 'Google',
			icon: '👀'
		},
		{
			modifier: Modifier.Hyper,
			key: 'n',
			description: 'Toggle Raycast Notes',
			action: 'Notes',
			icon: '🗒️'
		},
		{
			modifier: Modifier.Hyper,
			key: 'o',
			description: 'Launch Obsidian',
			action: 'Obsidian',
			icon: '🪨'
		},
		{
			modifier: Modifier.Hyper,
			key: 'r',
			description: 'Recognize text from screen with ScreenOCR',
			action: 'Recognize Text',
			icon: '👁️‍🗨️',
			url: 'https://www.raycast.com/huzef44/screenocr'
		},
		{
			modifier: Modifier.Hyper,
			key: 's',
			description: 'Toggle Spotify player',
			action: 'Spotify',
			icon: '🎵'
		},
		{
			modifier: Modifier.Hyper,
			key: 't',
			description: 'Open Microsoft Teams',
			action: 'Teams',
			icon: '👥'
		},
		{
			modifier: Modifier.Hyper,
			key: 'w',
			description: 'Open Web Browser',
			action: 'Web',
			icon: '🌐'
		},
		{
			modifier: Modifier.Hyper,
			key: 'x',
			description: 'Open Xcode',
			action: 'Xcode',
			icon: '🔨'
		},
		{
			modifier: Modifier.Hyper,
			key: 'z',
			description: 'Search history',
			action: 'History',
			icon: '⌛',
			url: 'https://www.raycast.com/Keyruu/zen-browser'
		},
		{
			modifier: Modifier.Hyper,
			key: '2',
			description: 'Open Mail',
			action: 'Mail',
			icon: '📧'
		},
		{
			modifier: Modifier.Hyper,
			key: '4',
			description: 'Search screenshots',
			action: 'Screenshots',
			icon: '📷'
		},
		{
			modifier: Modifier.Hyper,
			key: '.',
			description: 'Launch Terminal',
			action: 'Terminal',
			icon: '💻'
		},
		{
			modifier: Modifier.Hyper,
			key: '/',
			description: 'Search menu items',
			action: 'Menu Items',
			icon: '🔎',
		},
		{
			modifier: Modifier.Hyper,
			key: '`',
			description: 'Toggle AI Chat window',
			action: 'AI Chat',
			icon: '💬',
		},
		{
			modifier: Modifier.Alt,
			key: 'Tab',
			description: 'Search windows in the Raycast Window Switcher',
			action: 'Switch Windows',
			icon: '🪟',
		},
	];


	function clickKey(label: string) {
		console.log(label);
		const el = document.querySelector(`[data-key="${label}"]`) as HTMLElement | null;
		if (!el) return;
		el.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
		el.parentElement?.focus();
		setTimeout(() => {
			el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
		}, 150);
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (['Tab', ' '].includes(e.key) || document.querySelector('.DocSearch-Modal')) return;
		const label = normalizeEventKey(e.key);
		clickKey(label);
	}

	if (typeof window !== 'undefined') {
		window.addEventListener('keyup', handleKeyUp);
		onDestroy(() => window.removeEventListener('keyup', handleKeyUp));
	}
</script>

<svelte:head>
	<meta name="description" content="My Raycast configuration and keyboard shortcuts" />
</svelte:head>

<div class="container">
	<div class="mb-6 flex items-center justify-between">
		<Heading class="mb-0">Hotkeys</Heading>
		<Button
			variant="outline"
			title="Referral link to Raycast"
			href={raycastUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center gap-2 text-sm text-muted-foreground ring-1 ring-red-500/50 mt-1"
		>
			<img src={Raycast} alt="Raycast" class="h-4 w-4" />
			<span>Try Raycast</span>
		</Button>
	</div>

	<div class="my-8">
		<p class="text-card-foreground leading-loose">
			Since Raycast introduced the <Link href="https://manual.raycast.com/hyperkey" target="_blank" rel="noopener noreferrer">Hyper Key</Link>, 
			I've become a big fan and heavy user of this additional productivity layer. 
			<br>
			Hyper <Kbd class="text-xl pt-0">{Modifier.Hyper}</Kbd> means all modifier keys (<Kbd class="font-bold">{hyperKeys}</Kbd>) are triggered simultaneously with a single key, usually <Kbd class="font-bold">Caps Lock</Kbd>.
			<br>
			Here is an overview of the hotkeys I have defined and use across multiple devices for my daily workflow. 
			
		</p>
	</div>

	<div class="grid gap-6">
		<!-- Virtual Keyboard -->
		<Card.Root class="hidden sm:block">
			<Card.Content>
				<VirtualKeyboard {shortcuts} />
				<div class="mt-4 text-center">
					<div class="text-sm text-muted-foreground">
						Hover over highlighted keys to see their Raycast shortcuts (or try typing a key)
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Shortcuts List -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Command class="h-5 w-5" />
					Shortcuts Reference
				</Card.Title>
				<Card.Description>Some of my Raycast shortcuts. (Window management uses the arrow keys)</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-3">
					{#each shortcuts as shortcut}
						{#if shortcut.modifier}
							<div class="flex flex-col md:flex-row items-start md:items-center justify-start sm:justify-between rounded-lg border p-3 gap-3">
								<!-- Left section: Icon, Action, and Desktop Description -->
								<div class="flex flex-1 items-center gap-3">
									<span class="text-2xl">{shortcut.icon}</span>
									<div class="flex flex-col">
										<div class="font-medium">{shortcut.action}
											{#if shortcut.url}
												<a href={shortcut.url} target="_blank" rel="noopener noreferrer" class="ml-1">
													<Kbd class="text-xs">Extension</Kbd>
												</a>
											{/if}
										</div>
										<!-- Description for desktop, hidden on mobile -->
										<div class="hidden md:block text-sm text-muted-foreground md:mt-1">{shortcut.description}</div>
									</div>
								</div>
								<!-- Right section: Mobile Description and Key Combination -->
								<div class="flex flex-1 w-full flex-row items-center gap-2 md:flex-none md:w-auto">
									<!-- Description for mobile, hidden on desktop -->
									<div class="flex flex-1 text-sm text-muted-foreground md:hidden">{shortcut.description}</div>
									<div class="flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-mono text-sm self-end sm:self-auto">
										<span class="{shortcut.modifier === Modifier.Hyper ? 'pb-1 ' : ''}text-2xl">{shortcut.modifier}</span>
										<span class="font-bold">+</span>
										<span class="font-bold">{SpecialChar[shortcut.key as keyof typeof SpecialChar] || shortcut.key.toUpperCase()}</span>
									</div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="my-8 rounded-lg border bg-muted/50 p-4">
		<h3 class="mb-2 font-semibold">About Raycast</h3>
		<p class="text-sm text-muted-foreground pb-4">
			Raycast is a blazingly fast, totally extendable launcher for Mac. It lets you complete tasks,
			calculate, share common links, and much more. This page showcases my personal configuration
			and the shortcuts I use daily to boost productivity.
			<br><br>
			<Link href={raycastUrl} target="_blank" rel="noopener noreferrer">Learn more about Raycast</Link> 
			(referral link)
		</p>
	</div>
</div>
