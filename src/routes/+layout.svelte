<script lang="ts">
	import '../app.pcss';
	import { ModeWatcher, mode } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import Command from './Command.svelte';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import { page } from '$app/state';
	import { theme, debug, debugLog, isCommandActive, resetColors } from '$lib/stores/app';
	import { onMount } from 'svelte';
	import { Spring, Tween } from 'svelte/motion';

	import { cubicOut } from 'svelte/easing';
	import { browser } from '$app/environment';
	import { cn } from '$lib/utils/utils';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Info, LayoutGrid, List, ListMusic, Signpost, Slash, TabletSmartphone, Terminal, Webhook, Keyboard } from 'lucide-svelte';
	import type { BookmarkItem } from './Menu.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { capitalize } from '$lib/utils/helper';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import pages from '../data/pages.json';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	let innerWidth = $state(0);
	let innerHeight = $state(0);

	const cursor = Spring.of(() => ({ x: 0, y: 0 }), {
		stiffness: 0.05,
		damping: 0.25,
		precision: 0.5
	});

	let innerRadius = Tween.of(
		() => (browser && page.url.pathname !== '/' ? window?.innerWidth : 200),
		{
			duration: 300,
			easing: cubicOut
		}
	);
	let outerRadius = Tween.of(
		() => (browser && page.url.pathname !== '/' ? window?.innerWidth : 300),
		{
			duration: 300,
			easing: cubicOut
		}
	);
	function changeRadius(inner: number = 300, outer?: number, duration = 1000) {
		innerRadius.set(inner, { duration });
		outerRadius.set(outer || inner * 2, { duration });
	}
	// mask
	const maskWidth = Tween.of(() => 300, {
		duration: 300,
		easing: cubicOut
	});
	const maskHeight = Tween.of(() => 200, {
		duration: 300,
		easing: cubicOut
	});
	function setMaskSize(x: number = 300, y?: number, duration = 1000) {
		maskWidth.set(x, { duration });
		maskHeight.set(y || x, { duration });
	}

	let timeout: number | undefined = undefined;
	function handleMouseMove(event?: MouseEvent & { timeout?: number; duration?: number }) {
		clearTimeout(timeout);
		switch (page.url.pathname) {
			case '/':
				if (event) {
					// focus on cursor
					const size = event?.buttons ? 50 : 100;
					setMaskSize(size, size, event.duration);
					changeRadius(size, size * 2, event.duration);

					timeout = setTimeout(() => {
						// reset after inactivity
						setMaskSize(300, 200);
						changeRadius(300, 500);
						cursor.set({ x: innerWidth / 2, y: innerHeight / 3 }, { soft: true });
					}, event.timeout || 1200);
					cursor.set({ x: event.clientX, y: event.clientY - 100 });
				} else {
					cursor.set({ x: innerWidth / 2, y: innerHeight / 3 });
					changeRadius(300, 500);
				}

				break;
			case '/settings':
				// focus on top area
				cursor.set({ x: innerWidth / 2, y: innerHeight / 4 });
				setMaskSize(400, 200, 800);
				changeRadius(800, 1000);
				break;
			case '/about':
				// focus on the top left area
				cursor.set({ x: innerWidth / 3, y: innerHeight / 2.5 });
				setMaskSize(300, 200);
				changeRadius(500, 900);
				break;
			default:
				// full page content, no masking
				cursor.set({ x: innerWidth / 2, y: innerHeight / 2 });
				setMaskSize(300, 200);
				const largestEdge = Math.max(innerWidth, innerHeight);
				changeRadius(largestEdge, largestEdge + 200);
				break;
		}
	}

	onMount(() => {
		cursor.set({ x: innerWidth / 2, y: innerHeight / 2 });
		if (page.url.pathname === '/') {
			cursor.set({ x: innerWidth / 2, y: innerHeight / 3 }); // initial positioning around hero window
		} else if (browser) {
			cursor.set({ x: innerWidth / 2, y: innerHeight / 2 });
			changeRadius(innerWidth * 4, innerWidth * 4, 0);
		}
		handleMouseMove();
		setTimeout(() => {
			// wait a bit before following cursor after page is loaded
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('dragover', handleMouseMove);
		}, 1000);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('dragover', handleMouseMove);
		};
	});

	$effect.pre(() => {
		debugLog('Debug Mode', $debug ? 'enabled' : 'disabled');
	});

	$effect(() => {
		if (page.url.href) {
			$isCommandActive = false;
			debugLog('Visiting new page: ' + page.url.href);
			handleMouseMove();
		}
	});

	$effect(() => {
		if ($mode) {
			document.documentElement.setAttribute('data-theme', $mode);
			debugLog('Theme was set to ' + $mode);
			resetColors();
			// handleMouseMove({ clientX: innerWidth / 2, clientY: -100, timeout: 0 } as MouseEvent & { timeout: number })
		}
		debugLog(`${$isCommandActive ? 'Opening' : 'Closing'} command window`);
	});

	let isLightMode = $derived($mode === 'light');
	let isFullWidth = $derived(page.url.pathname === '/experiment');
	let bgClass = $derived(
		isLightMode
			? 'bg-[radial-gradient(#e5e5e5_1px,transparent_1px)]'
			: 'bg-[radial-gradient(#222222_1px,transparent_1px)]'
	);

	const bookmarksRaw: BookmarkItem[] = [
		{ name: 'Now', href: '/now', icon: Info },
		{ name: 'Uses', href: '/uses', icon: TabletSmartphone },
		{ name: 'Projects', href: '/projects', icon: LayoutGrid },
		{ name: 'Playlists', href: '/playlists', icon: ListMusic },
		{ name: 'Hotkeys', href: '/hotkeys', icon: Keyboard },
		{ name: 'Redirects', href: '/redirects', icon: Signpost },
		{ name: 'Slashes', href: '/slashes', icon: Slash, hidden: true },
		{ name: 'Terminal', href: '/terminal', icon: Terminal, hidden: true },
    	{ name: 'Changelog', href: '/log', icon: List, hidden: true },
    	{ name: 'API', href: '/api', icon: Webhook, hidden: true },
    	{ name: 'Status', href: '/status', icon: Webhook, hidden: true },
	];
	const bookmarks: BookmarkItem[] = $derived(bookmarksRaw.map(b => ({
		...b,
		name: i18n.t(`common.${b.name.toLowerCase()}`) !== `common.${b.name.toLowerCase()}`
			? i18n.t(`common.${b.name.toLowerCase()}`)
			: b.name
	})));
	const otherPages = pages.filter(page => !bookmarksRaw.some(bookmark => bookmark.name === page.title));
	const otherBookmarks = $derived(otherPages.map(page => {
		const translatedName = i18n.t(`common.${page.title.toLowerCase()}`);
		return {
			name: translatedName !== `common.${page.title.toLowerCase()}` ? translatedName : page.title,
			href: page.path,
			icon: Info,
		};
	}));
	const allPages = $derived([...bookmarks, ...otherBookmarks]);
</script>

<svelte:head>
	<style>
		@import '/themes.css';
	</style>
	<title>{page.url.pathname === '/' ? i18n.t('common.home') : capitalize(page.url.pathname.replace('/',''))}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<ModeWatcher />
<Toaster />
<Command pages={allPages} />

<svelte:window bind:innerWidth bind:innerHeight />

<div class="flex h-screen w-full flex-grow flex-col">
	<div class="w-fixed w-full p-6 sm:px-16 print:hidden">
		<div class="sticky top-0 h-full w-full">
			<Header pages={bookmarks} />
		</div>
	</div>

	<main
		class={cn(
			`inset-0 h-max max-h-screen w-full flex-grow overflow-y-auto [background-size:16px_16px] ${isFullWidth ? 'p-0' : 'pt-4 sm:px-16'} print:max-h-none`,
			bgClass,
			`theme-${$theme}`
		)}
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			role="region"
			onmousedown={() => setMaskSize(50)}
			onmouseup={() => setMaskSize(100)}
			class="pointer-events-none absolute inset-0 top-20 transition-[background-position] duration-100"
			style="--tw-bg-opacity: 0.8; background-image: radial-gradient({maskWidth.current}px {maskHeight.current}px at var(--x) var(--y), transparent 0%, transparent {innerRadius.current}px, rgba({isLightMode
				? '255, 255, 255'
				: '0, 0, 0'}, var(--tw-bg-opacity)) {outerRadius.current}px); --x: {cursor.current
				.x}px; --y: {cursor.current.y}px;"
		></div>
		<Tooltip.Provider>
			{@render children?.()}
		</Tooltip.Provider>
	</main>
	<Footer />
</div>
