<script lang="ts">
    import { onDestroy } from 'svelte';
	import { Heading, Link, Kbd } from '$lib/components/typography';
	import * as Card from '$lib/components/ui/card';
	import { Command } from 'lucide-svelte';
	import VirtualKeyboard, { Modifier, normalizeEventKey, SpecialChar, type Shortcut } from './VirtualKeyboard.svelte';
	import Raycast from '$lib/components/icons/raycast.svg';
	import { getRedirectByName } from '$lib/redirects';
	import { Button } from '$lib/components/ui/button';
	import { isCommandActive } from '$lib/stores/app';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';

	const raycastUrl = getRedirectByName('raycast')?.url;

	// Raycast shortcuts configuration
	const hyperKeys = '⌘⌥⌃⇧';

	/**
	 * Reactive shortcuts list that updates action labels and descriptions
	 * when the active language changes.
	 */
	const shortcuts: Shortcut[] = $derived([
		{
			modifier: Modifier.Ctrl,
			key: 'Space',
			description: i18n.t('hotkeys.descriptions.spotlight'),
			action: i18n.t('hotkeys.actions.raycast_launcher'),
			icon: '🚀'
		},
		{
			key: 'Caps',
			description: i18n.t('hotkeys.descriptions.capslock', { hyperKeys }),
			action: i18n.t('hotkeys.actions.hyper_key'),
			icon: Modifier.Hyper
		},
		{
			modifier: Modifier.Hyper,
			key: 'c',
			description: i18n.t('hotkeys.descriptions.clipboard'),
			action: i18n.t('hotkeys.actions.clipboard_manager'),
			icon: '📋'
		},
		{
			modifier: Modifier.Hyper,
			key: 'v',
			description: i18n.t('hotkeys.descriptions.snippets'),
			action: i18n.t('hotkeys.actions.snippets'),
			icon: '📝'
		},
		{
			modifier: Modifier.Hyper,
			key: 'b',
			description: i18n.t('hotkeys.descriptions.bitwarden'),
			action: i18n.t('hotkeys.actions.bitwarden'),
			icon: '🔒'
		},
		{
			modifier: Modifier.Hyper,
			key: 'd',
			description: i18n.t('hotkeys.descriptions.downloads'),
			action: i18n.t('hotkeys.actions.downloads'),
			icon: '📥'
		},
		{
			modifier: Modifier.Hyper,
			key: 'e',
			description: i18n.t('hotkeys.descriptions.editor'),
			action: i18n.t('hotkeys.actions.editor'),
			icon: '⌨️'
		},
		{
			modifier: Modifier.Hyper,
			key: 'f',
			description: i18n.t('hotkeys.descriptions.finder'),
			action: i18n.t('hotkeys.actions.finder'),
			icon: '📁'
		},
		{
			modifier: Modifier.Hyper,
			key: 'g',
			description: i18n.t('hotkeys.descriptions.google'),
			action: i18n.t('hotkeys.actions.google'),
			icon: '👀'
		},
		{
			modifier: Modifier.Hyper,
			key: 'n',
			description: i18n.t('hotkeys.descriptions.notes'),
			action: i18n.t('hotkeys.actions.notes'),
			icon: '🗒️'
		},
		{
			modifier: Modifier.Hyper,
			key: 'o',
			description: i18n.t('hotkeys.descriptions.obsidian'),
			action: i18n.t('hotkeys.actions.obsidian'),
			icon: '🪨'
		},
		{
			modifier: Modifier.Hyper,
			key: 'r',
			description: i18n.t('hotkeys.descriptions.recognize_text'),
			action: i18n.t('hotkeys.actions.recognize_text'),
			icon: '👁️‍🗨️',
			url: 'https://www.raycast.com/huzef44/screenocr'
		},
		{
			modifier: Modifier.Hyper,
			key: 's',
			description: i18n.t('hotkeys.descriptions.spotify'),
			action: i18n.t('hotkeys.actions.spotify'),
			icon: '🎵'
		},
		{
			modifier: Modifier.Hyper,
			key: 't',
			description: i18n.t('hotkeys.descriptions.teams'),
			action: i18n.t('hotkeys.actions.teams'),
			icon: '👥'
		},
		{
			modifier: Modifier.Hyper,
			key: 'w',
			description: i18n.t('hotkeys.descriptions.web'),
			action: i18n.t('hotkeys.actions.web'),
			icon: '🌐'
		},
		{
			modifier: Modifier.Hyper,
			key: 'x',
			description: i18n.t('hotkeys.descriptions.xcode'),
			action: i18n.t('hotkeys.actions.xcode'),
			icon: '🔨'
		},
		{
			modifier: Modifier.Hyper,
			key: 'z',
			description: i18n.t('hotkeys.descriptions.history'),
			action: i18n.t('hotkeys.actions.history'),
			icon: '⌛',
			url: 'https://www.raycast.com/Keyruu/zen-browser'
		},
		{
			modifier: Modifier.Hyper,
			key: '2',
			description: i18n.t('hotkeys.descriptions.mail'),
			action: i18n.t('hotkeys.actions.mail'),
			icon: '📧'
		},
		{
			modifier: Modifier.Hyper,
			key: '4',
			description: i18n.t('hotkeys.descriptions.screenshots'),
			action: i18n.t('hotkeys.actions.screenshots'),
			icon: '📷'
		},
		{
			modifier: Modifier.Hyper,
			key: '.',
			description: i18n.t('hotkeys.descriptions.terminal'),
			action: i18n.t('hotkeys.actions.terminal'),
			icon: '💻'
		},
		{
			modifier: Modifier.Hyper,
			key: '/',
			description: i18n.t('hotkeys.descriptions.menu_items'),
			action: i18n.t('hotkeys.actions.menu_items'),
			icon: '🔎',
		},
		{
			modifier: Modifier.Hyper,
			key: '`',
			description: i18n.t('hotkeys.descriptions.ai_chat'),
			action: i18n.t('hotkeys.actions.ai_chat'),
			icon: '💬',
		},
		{
			modifier: Modifier.Alt,
			key: 'Tab',
			description: i18n.t('hotkeys.descriptions.switch_windows'),
			action: i18n.t('hotkeys.actions.switch_windows'),
			icon: '🪟',
		},
	]);


	function clickKey(label: string) {
		const el = document.querySelector(`[data-key="${label}"]`) as HTMLElement | null;
		if (!el) return;
		el.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
		el.parentElement?.focus();
		setTimeout(() => {
			el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
		}, 150);
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (['Tab', ' '].includes(e.key) || document.querySelector('.DocSearch-Modal') || $isCommandActive) return;
		const label = normalizeEventKey(e.key);
		clickKey(label);
	}

	$effect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('keyup', handleKeyUp);
			return () => window.removeEventListener('keyup', handleKeyUp);
		}
	});
</script>

<svelte:head>
	<title>{i18n.t('hotkeys.title')}{PAGE_TITLE_SUFFIX}</title>
	<meta name="description" content={i18n.t('hotkeys.meta_description')} />
</svelte:head>

<div class="container">
	<div class="mb-6 flex items-center justify-between">
		<Heading class="mb-0">{i18n.t('hotkeys.heading')}</Heading>
		<Button
			variant="outline"
			title={i18n.t('hotkeys.referral_title')}
			href={raycastUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center gap-2 text-sm text-muted-foreground ring-1 ring-red-500/50 mt-1"
		>
			<img src={Raycast} alt="Raycast" class="h-4 w-4" />
			<span>{i18n.t('hotkeys.try_raycast')}</span>
		</Button>
	</div>

	<div class="my-8">
		<p class="text-card-foreground leading-loose">
			{i18n.t('hotkeys.intro.prefix')}
			<Link href="https://manual.raycast.com/hyperkey" target="_blank" rel="noopener noreferrer">
				{i18n.t('hotkeys.intro.hyper_key')}
			</Link>
			{i18n.t('hotkeys.intro.middle')}
			<br>
			{i18n.t('hotkeys.intro.hyper_text')} <Kbd class="text-xl pt-0">{Modifier.Hyper}</Kbd>
			{i18n.t('hotkeys.intro.means_all')} <Kbd class="font-bold">{hyperKeys}</Kbd>
			{i18n.t('hotkeys.intro.triggered_simultaneously')} <Kbd class="font-bold">{i18n.t('hotkeys.intro.caps_lock')}</Kbd>.
			<br>
			{i18n.t('hotkeys.intro.description')}
		</p>
	</div>

	<div class="grid gap-6">
		<!-- Virtual Keyboard -->
		<Card.Root class="hidden sm:block">
			<Card.Content>
				<VirtualKeyboard {shortcuts} />
				<div class="mt-4 text-center">
					<div class="text-sm text-muted-foreground">
						{i18n.t('hotkeys.keyboard_help')}
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Shortcuts List -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Command class="h-5 w-5" />
					{i18n.t('hotkeys.shortcuts_reference')}
				</Card.Title>
				<Card.Description>{i18n.t('hotkeys.shortcuts_description')}</Card.Description>
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
													<Kbd class="text-xs">{i18n.t('hotkeys.extension')}</Kbd>
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
		<h3 class="mb-2 font-semibold">{i18n.t('hotkeys.about.title')}</h3>
		<p class="text-sm text-muted-foreground pb-4">
			{i18n.t('hotkeys.about.description')}
			<br><br>
			<Link href={raycastUrl} target="_blank" rel="noopener noreferrer">
				{i18n.t('hotkeys.about.link_text')}
			</Link>
			{i18n.t('hotkeys.about.referral_note')}
		</p>
	</div>
</div>
