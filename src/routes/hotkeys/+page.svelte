<script lang="ts">
	import { Heading, Link, Kbd } from '$lib/components/typography';
	import * as Card from '$lib/components/ui/card';
	import { Command } from 'lucide-svelte';
	import VirtualKeyboard, { Modifier, type Shortcut } from './VirtualKeyboard.svelte';
	import Raycast from '$lib/components/icons/raycast.svg';
	import { getRedirectByName } from '$lib/redirects';
	import { Button } from '$lib/components/ui/button';
	const raycastUrl = getRedirectByName('raycast')?.url;

	// Raycast shortcuts configuration
	const hyperKeys = '⌘⌥⌃⇧';
	const shortcuts: Shortcut[] = [
		{
			modifier: Modifier.Ctrl,
			key: 'space',
			description: 'I use Ctrl as modifier to keep Spotlight available as well',
			action: 'Raycast Launcher',
			icon: '🚀'
		},
		{
			key: 'caps lock',
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
			key: 'f',
			description: 'Open current Finder window',
			action: 'Finder',
			icon: '📁'
		},
		{
			modifier: Modifier.Hyper,
			key: 'r',
			description: 'Recognize text from screen with OCR',
			action: 'Recognize Text',
			icon: '🔍'
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
			icon: '⌛'
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
			key: 'tab',
			description: 'Search windows in Raycast Window Switcher',
			action: 'Switch Windows',
			icon: '🔎',
		},
	];
	const hyperKey = Modifier.Hyper || hyperKeys;
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

	<div class="mb-8">
		<p class="text-muted-foreground leading-loose">
			Since Raycast introduced the <Link href="https://manual.raycast.com/hyperkey" target="_blank" rel="noopener noreferrer">Hyper Key</Link>, 
			I have become a big fan and heavy user of this additional productivity layer. 
			<br>
			Hyper <Kbd class="text-xl pt-0">{Modifier.Hyper}</Kbd> means all modifier keys (<Kbd class="font-bold">{hyperKeys}</Kbd>) are triggered with a single key, usually <Kbd class="font-bold">Caps Lock</Kbd>.
			<br>
			Here is an overview of the hotkeys I have defined and use across multiple devices for my daily workflow. 
			
		</p>
	</div>

	<div class="grid gap-6">
		<!-- Virtual Keyboard -->
		<Card.Root class="hidden sm:block">
			<Card.Content>
				<VirtualKeyboard {shortcuts} />
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
							<div class="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between rounded-lg border p-3 gap-3">
								<div class="flex items-center gap-3">
									<span class="text-2xl">{shortcut.icon}</span>
									<div>
										<div class="font-medium">{shortcut.action}</div>
										<div class="text-sm text-muted-foreground">{shortcut.description}</div>
									</div>
								</div>
								<div class="flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-mono text-sm self-end sm:self-auto">
									<span class="pb-1 text-2xl">{hyperKey}</span>
									<span class="font-bold">+</span>
									<span class="font-bold">{shortcut.key.toUpperCase()}</span>
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
