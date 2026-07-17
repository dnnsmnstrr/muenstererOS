<script module lang="ts">
	type CommandData = {
		id?: string;
		name: string;
		keywords?: string[];
		value?: string;
		group?: string;
		icon?: ConstructorOfATypedSvelteComponent;
		href?: string;
		action?: () => void;
		description?: string;
	};

	type NoteListItem = {
		name: string;
		path: string;
		sha: string;
	};

	type NoteSearchResult = {
		title: string;
		description?: string;
		href: string;
	};

	type PagefindData = {
		url: string;
		plain_excerpt?: string;
		meta?: { title?: string };
		sub_results?: Array<{
			title: string;
			url: string;
			plain_excerpt?: string;
		}>;
	};

	type PagefindModule = {
		init: () => Promise<void>;
		debouncedSearch: (
			query: string,
			options?: Record<string, unknown>,
			debounceMs?: number
		) => Promise<{
			results: Array<{ data: () => Promise<PagefindData> }>;
		} | null>;
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
		LayoutGrid,
		RotateCcw,
		Monitor,
		Plus,
		Globe,
		Download,
		CircleCheck,
		Circle,
		FileCode,
		Trophy,
		FileText,
		LoaderCircle
	} from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Dialog from '$lib/components/ui/dialog';
	import { mode, toggleMode } from 'mode-watcher';
	import { onMount } from 'svelte';
	import {
		isCommandActive,
		debug,
		debugLog,
		showHelp,
		screensaver,
		trackCommand,
		commandStats,
		suggestionsLimit
	} from '$lib/stores/app';
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import {
		capitalize,
		reloadPage,
		scrollToBottom,
		scrollToTop,
		toggleFullscreen
	} from '$lib/utils/index';
	import { toast } from 'svelte-sonner';
	import confetti from 'canvas-confetti';
	import List from '$lib/components/typography/List.svelte';
	import Kbd from '$lib/components/typography/Kbd.svelte';
	import { page } from '$app/state';
	import { links, gists } from '$lib/config';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import * as env from '$env/static/public';
	import { unlockAchievement } from '$lib/stores/achievements';
	import { CHEAT_CODES, triggerCheatAnimation, findCheatCode } from '$lib/utils/cheatcodes';
	import docsearch from '@docsearch/js';
	import '@docsearch/css';
	import type { BookmarkItem } from './Menu.svelte';
	import {
		resetDesktopFiles,
		screensaverActive,
		desktopFiles,
		addFileToDesktop
	} from '$lib/stores/desktop';
	import { redirects } from '$lib/redirects';
	import { getRedirectURL } from '$lib/utils/redirect';
	import { trackRedirect } from '$lib/utils/analytics';

	interface Props {
		pages?: BookmarkItem[];
	}

	let { pages = [] }: Props = $props();

	let loading = false;
	let query = $state('');
	let selectedCommandValue = $state('');
	let lastKey = '';
	let hasGithubToken = $state(false);
	let notes = $state<NoteListItem[]>([]);
	let noteSearchResults = $state<NoteSearchResult[]>([]);
	let notesLoading = $state(false);
	let noteSearchLoading = $state(false);
	let noteSearchAvailable = $state(true);
	let notesLoadPromise: Promise<void> | null = null;
	let pagefindPromise: Promise<PagefindModule> | null = null;
	let noteSearchRequest = 0;

	const NOTES_SITE_URL = 'https://dnnsmnstrr.github.io/zettelkasten/';
	const PAGEFIND_URL = `${NOTES_SITE_URL}pagefind/pagefind.js`;

	const keyboardShortcuts = $derived([
		{ key: '?', description: i18n.t('command.shortcuts.help') },
		{ key: 'esc', description: i18n.t('command.shortcuts.close') },
		{ key: '/', description: i18n.t('command.shortcuts.search_zettelkasten') },
		{ key: ['⌘', ','], description: i18n.t('command.shortcuts.settings') },
		{ key: ['⌘', 'F'], description: i18n.t('command.shortcuts.fullscreen') },
		{ key: ['⌘', 'K'], description: i18n.t('command.shortcuts.command_palette') }
	]);

	const gotoShortcuts: Record<string, string> = {
		a: '/about',
		b: '/ping',
		c: '/concerts',
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
	let keyBuffer: string[] = [];
	const bufferLimit = Math.max(
		...CHEAT_CODES.map((c) => c.sequence?.length || c.code?.length || 0)
	);

	function selectedCommandHref() {
		const selectedCommand = Object.values(commandConfig)
			.flat()
			.find((command) => command.value === selectedCommandValue);

		return selectedCommand?.href || null;
	}

	async function copySelectedCommand(href: string) {
		const url = new URL(href, window.location.href).href;
		await navigator.clipboard.writeText(url);
		toast.success(i18n.t('command.copied_to_clipboard'), {
			description: url
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if ($debug) console.log(e);
		if (
			((e.metaKey && e.altKey) || (e.ctrlKey && e.altKey)) &&
			(e.code === 'KeyI' || e.key.toLowerCase() === 'i')
		)
			return; // Allow dev tools to open (Cmd+Opt+I on Mac, Ctrl+Alt+I on Windows)
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
			debugLog('DocSearch-Modal is open, ignoring keydown event');
			return;
		}

		if (
			$isCommandActive &&
			(e.metaKey || e.ctrlKey) &&
			(e.key.toLowerCase() === 'c')
		) {
			const href = selectedCommandHref();
			if (href) {
				e.preventDefault();
				e.stopImmediatePropagation();
				void copySelectedCommand(href);
				return;
			}
		}

		// cheat code recognition
		keyBuffer.push(e.key);
		keyBuffer = keyBuffer.slice(-bufferLimit);

		const cheat = findCheatCode(keyBuffer);
		if (cheat) {
			debugLog(`Cheat code detected: ${cheat.id}`);
			triggerCheatAnimation(cheat.animation);
			unlockAchievement('cheatcode');
			keyBuffer = [];
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
			if (currentGroup) {
				e.preventDefault();
				e.stopImmediatePropagation();
				leaveCurrentGroup();
				return;
			} else {
				$isCommandActive = false;
			}
		}
		const isOverlayVisible = $isCommandActive || $showHelp;
		if (['Escape', '/'].includes(e.key) && isOverlayVisible) {
			$showHelp = false;
		}

		const pagesWithSearchField = ['/redirects', '/uses', '/playlists', '/terminal', '/ping']; // immediately search on these pages
		if (
			pagesWithSearchField.includes(page.url.pathname) &&
			!isOverlayVisible &&
			!['Enter', 'Tab', 'Escape'].includes(e.key)
		) {
			const input = document.querySelector('input') || document.querySelector('textarea');
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
		const appId = (env as any).PUBLIC_ALGOLIA_APP_ID;
		const apiKey = (env as any).PUBLIC_ALGOLIA_API_KEY;

		if (!appId || !apiKey) {
			debugLog('Algolia credentials not found, skipping DocSearch initialization');
			return;
		}

		docsearch({
			container: '#docsearch',
			appId,
			apiKey,
			indexName: 'dnnsmnstrr-gitlab',
			placeholder: i18n.t('command.search_zettelkasten') === 'command.search_zettelkasten' ? 'Search...' : i18n.t('command.search_zettelkasten'),
			insights: true,
			navigator: {
				// https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/keyboard-navigation/
				navigate({ itemUrl, item, ...rest}) {
					if (itemUrl.includes('zettelkasten')) {
						const slug = itemUrl.split('/').pop()?.replace('.md', '').replace('#', '');
						console.log('slug:', item, rest);
						if (item.hierarchy.lvl1) {
							goto(`/notes/${item.hierarchy.lvl1.toLowerCase().replaceAll(' ', '') || slug}${item.hierarchy.lvl2 ? `#${item.hierarchy.lvl2.toLowerCase().replace(/\s+/g, '-')}` : ''}`);
							return;
						}
					} else {
						const windowReference = window.open(itemUrl, '_blank', 'noopener');
						if (windowReference) {
							windowReference.focus();
						}
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

		if (browser) {
			hasGithubToken = !!localStorage.getItem('github_admin_token');
		}

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
		if (query) {
			const cheat = CHEAT_CODES.find((c) => c.code === query.toLowerCase());
			if (cheat) {
				debugLog(`Cheat code detected: ${cheat.id}`);
				triggerCheatAnimation(cheat.animation);
				unlockAchievement('cheatcode');
				query = '';
			}
		}
	});

	const enrichLink = (
		link: CommandData,
		translationKey?: string,
		isGroup?: boolean
	): CommandData => {
		let href = link.href || '';
		if (!link.href && !link.action) {
			href = '/' + link.name.toLowerCase();
		}

		const id = link.id || href || translationKey || link.name;

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

		const wrappedAction = () => {
			const isInternalNavigation =
				!!link.group || id === 'command.go_back_screensaver' || id === 'command.go_back_edit_gist';

			if (!isInternalNavigation) {
				$isCommandActive = false;
				query = '';
			}

			action();

			trackCommand(id, link.name, isGroup);
		};

		let value = link.value || link.name;
		return {
			...link,
			id,
			keywords: link.keywords || link.name.toLowerCase().split(' '),
			href,
			action: wrappedAction,
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
	].map((link) => enrichLink(link));

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
			debugLog('DocSearch error', error);
		}
	}

	let currentGroup = $state<string | null>(null);

	function leaveCurrentGroup() {
		currentGroup = null;
		query = '';
		noteSearchResults = [];
	}

	async function loadNotes() {
		if (notes.length > 0) return;
		if (notesLoadPromise) return notesLoadPromise;

		notesLoading = true;
		notesLoadPromise = (async () => {
			try {
				const response = await fetch('/api/notes');
				if (!response.ok) throw new Error(`Notes request failed with ${response.status}`);

				const data: unknown = await response.json();
				if (!Array.isArray(data)) throw new Error('Notes response was not a list');
				notes = data as NoteListItem[];
			} catch (error) {
				debugLog('Failed to load notes for the command palette', error);
				toast.error(i18n.t('command.notes_load_error'));
			} finally {
				notesLoading = false;
				notesLoadPromise = null;
			}
		})();

		return notesLoadPromise;
	}

	async function loadPagefind() {
		if (pagefindPromise) return pagefindPromise;

		pagefindPromise = (async () => {
			const pagefind = (await import(/* @vite-ignore */ PAGEFIND_URL)) as PagefindModule;
			await pagefind.init();
			return pagefind;
		})();

		try {
			return await pagefindPromise;
		} catch (error) {
			noteSearchAvailable = false;
			debugLog('Pagefind note search is unavailable; using filename search', error);
			throw error;
		}
	}

	function noteHref(url: string) {
		const parsed = new URL(url, NOTES_SITE_URL);
		const slug = decodeURIComponent(parsed.pathname)
			.replace(/^\/zettelkasten\/?/, '')
			.replace(/\/$/, '');

		return slug ? `/notes/${slug}${parsed.hash}` : '/notes';
	}

	async function searchNotes(searchQuery: string) {
		const request = ++noteSearchRequest;
		noteSearchLoading = true;

		try {
			const pagefind = await loadPagefind();
			const search = await pagefind.debouncedSearch(searchQuery, {}, 150);
			if (!search || request !== noteSearchRequest) return;

			const pages = await Promise.all(search.results.slice(0, 8).map((result) => result.data()));
			if (request !== noteSearchRequest) return;

			noteSearchResults = pages.map((result) => {
				const section = result.sub_results?.[0];
				return {
					title: section?.title || result.meta?.title || noteHref(result.url).split('/').pop() || '',
					description: section?.plain_excerpt || result.plain_excerpt,
					href: noteHref(section?.url || result.url)
				};
			});
		} catch {
			// Filename matching remains available when the remote index cannot be loaded.
		} finally {
			if (request === noteSearchRequest) noteSearchLoading = false;
		}
	}

	function enterNotes() {
		currentGroup = 'notes';
		query = '';
		void loadNotes();
		void loadPagefind().catch(() => undefined);
	}

	function enterRedirects() {
		currentGroup = 'redirects';
		query = '';
	}

	$effect(() => {
		if (currentGroup !== 'notes') return;

		const searchQuery = query.trim();
		if (!searchQuery) {
			noteSearchRequest++;
			noteSearchResults = [];
			noteSearchLoading = false;
			return;
		}

		void searchNotes(searchQuery);
	});

	const visibleNotes = $derived.by<NoteSearchResult[]>(() => {
		if (query.trim() && noteSearchAvailable && noteSearchResults.length > 0) {
			return noteSearchResults;
		}

		const normalizedQuery = query.trim().toLowerCase();
		return notes
			.filter((note) => !normalizedQuery || note.name.toLowerCase().includes(normalizedQuery))
			.slice(0, normalizedQuery ? 20 : notes.length)
			.map((note) => ({ title: note.name, description: undefined, href: `/notes/${note.name}` }));
	});

	let commandConfig = $derived.by(() => {
		const config: Record<string, CommandData[]> = {
			navigation: [
				enrichLink({ name: i18n.t('common.home'), icon: Home, href: '/' }),
				enrichLink({ name: i18n.t('common.about'), icon: User, href: '/about' }),
				...pages
					.filter(
						(page) => !['/', '/about', '/achievements'].includes(page.href || '')
					)
					.map((p) => enrichLink(p)),
				enrichLink(
					{
						name: i18n.t('command.search_notes'),
						keywords: ['search', 'notes', 'zettelkasten', 'knowledge', 'second brain'],
						icon: Search,
						group: 'notes',
						action: enterNotes
					},
					'command.search_notes'
				),
				enrichLink(
					{
						name: i18n.t('command.search_redirects'),
						keywords: ['search', 'redirects', 'aliases', 'shortcuts'],
						icon: Link,
						group: 'redirects',
						action: enterRedirects
					},
					'command.search_redirects'
				),
				enrichLink(
					{
						name: i18n.t('command.keyboard_shortcuts'),
						keywords: ['help', 'hotkeys'],
						icon: Keyboard,
						action: () => {
							$showHelp = true;
							$isCommandActive = false;
						}
					},
					'command.keyboard_shortcuts'
				),
				enrichLink(
					{
						name: i18n.t('command.export_data'),
						value: 'export data, backup, download data',
						icon: Download,
						href: '/export'
					},
					'command.export_data'
				),
				enrichLink(
					{
						name: i18n.t('command.go_forward'),
						icon: ArrowRight,
						action: () => window.history.forward()
					},
					'command.go_forward'
				),
				enrichLink(
					{
						name: i18n.t('command.go_back'),
						icon: ArrowLeft,
						action: () => window.history.back()
					},
					'command.go_back'
				),
				enrichLink(
					{ name: i18n.t('command.reload'), icon: ArrowLeft, action: reloadPage },
					'command.reload'
				)
			].filter((link) => {
				// remove current page from navigation
				return page.url.pathname !== link.href;
			}),
			links: externalLinks,
			system: [
				enrichLink(
					{
						name: i18n.t('command.toggle_dark_mode'),
						value: 'toggle dark mode, theme, light',
						icon: $mode === 'light' ? Sun : Moon,
						action: toggleMode
					},
					'command.toggle_dark_mode'
				),
				enrichLink(
					{
						name: i18n.t('command.switch_language'),
						value:
							'switch language, change language, sprache wechseln, german, english, deutsch, englisch',
						icon: Globe,
						action: async () => {
							const newLanguage = i18n.lang === 'en' ? 'de' : 'en';
							await i18n.setLanguage(newLanguage);
							toast.success(i18n.t('command.language_switched'));
						}
					},
					'command.switch_language'
				),
				enrichLink(
					{
						name: $debug
							? i18n.t('command.disable_debug_mode')
							: i18n.t('command.enable_debug_mode'),
						icon: $debug ? BugOff : Bug,
						action: toggleDebug
					},
					'command.toggle_debug_mode'
				),
				enrichLink(
					{
						name: i18n.t('command.reset_desktop_files'),
						value: 'reset desktop files, restore file positions, clear desktop',
						icon: RotateCcw,
						action: () => {
							resetDesktopFiles();
							toast.success(i18n.t('command.reset_desktop_success'));
						}
					},
					'command.reset_desktop_files'
				),
				...(() => {
					// Only show "Create Desktop Shortcut" if current page has a bookmark entry
					const currentPage = pages.find(
						(p) =>
							p.href === page.url.pathname ||
							p.name.toLowerCase() === page.url.pathname.replace(/^\//, '')
					);
					if (!currentPage || page.url.pathname === '/') return [];

					return [
						enrichLink(
							{
								name: i18n.t('command.create_desktop_shortcut'),
								value: 'create desktop shortcut, add to desktop, pin to desktop',
								keywords: ['shortcut', 'desktop', 'add', 'pin', 'create'],
								icon: Plus,
								action: () => {
									const fileId =
										currentPage.name.toLocaleLowerCase() ||
										currentPage.href?.replace(/\//g, '') ||
										'page';
									const existingFile = $desktopFiles.find((f) => f.id === fileId);
									if (existingFile && !existingFile.hidden) {
										toast.info(i18n.t('command.shortcut_exists'));
									} else {
										addFileToDesktop({
											id: fileId,
											name: currentPage.name,
											href: currentPage.href || '/' + currentPage.name.toLowerCase(),
											icon: currentPage.icon
										});
										toast.success(i18n.t('command.shortcut_added', { name: currentPage.name }));
									}
								}
							},
							'command.create_desktop_shortcut'
						)
					];
				})()
			],
			fun: [
				enrichLink({ name: i18n.t('common.achievements'), icon: Trophy, href: '/achievements' }),
				enrichLink(
					{
						name: i18n.t('command.confetti'),
						keywords: ['party', 'celebrate'],
						icon: PartyPopper,
						action: () => {
							confetti();
						}
					},
					'command.confetti'
				)
			],
			settings: [
				enrichLink(
					{
						name: i18n.t('settings.screensaver'),
						icon: Monitor,
						group: 'screensaver',
						action: () => {
							currentGroup = 'screensaver';
							query = '';
						}
					},
					'settings.screensaver'
				),
				...(hasGithubToken
					? [
							enrichLink(
								{
									name: i18n.t('command.edit_gist'),
									icon: FileCode,
									group: 'edit_gist',
									action: () => {
										currentGroup = 'edit_gist';
										query = '';
									}
								},
								'command.edit_gist'
							)
						]
					: [])
			],
			redirects: [
				...redirects.map((redirect) =>
					enrichLink(
						{
							name: redirect.name,
							description: redirect.description || getRedirectURL(redirect),
							value: [
								redirect.name,
								redirect.description,
								redirect.url,
								...(redirect.aliases || [])
							]
								.filter(Boolean)
								.join(' '),
							icon: Link,
							href: getRedirectURL(redirect),
							action: () => {
								trackRedirect(redirect.name);
								window.open(getRedirectURL(redirect), '_blank', 'noopener,noreferrer');
							}
						},
						`redirect.${redirect.name}`,
						true
					)
				),
				enrichLink(
					{
						name: i18n.t('command.go_back'),
						icon: ArrowLeft,
						group: 'redirects',
						action: leaveCurrentGroup
					},
					'command.go_back_redirects',
					true
				)
			],
			notes: [
				...(notesLoading && visibleNotes.length === 0
					? [
							enrichLink(
								{
									name: i18n.t('common.loading'),
									icon: LoaderCircle,
									group: 'notes',
									action: () => undefined
								},
								'command.notes_loading',
								true
							)
						]
					: visibleNotes.map((note) =>
							enrichLink(
								{
									name: note.title,
									description: note.description,
									icon: FileText,
									href: note.href
								},
								`note.${note.href}`,
								true
							)
						)),
				...(noteSearchLoading
					? [
							enrichLink(
								{
									name: i18n.t('command.searching_notes'),
									icon: LoaderCircle,
									group: 'notes',
									action: () => undefined
								},
								'command.searching_notes',
								true
							)
						]
					: []),
				...(!noteSearchAvailable
					? [
							enrichLink(
								{
									name: i18n.t('command.search_zettelkasten'),
									icon: Search,
									action: handleDocsearch
								},
								'command.search_zettelkasten',
								true
							)
						]
					: []),
				enrichLink(
					{
						name: i18n.t('command.go_back'),
						icon: ArrowLeft,
						group: 'notes',
						action: leaveCurrentGroup
					},
					'command.go_back_notes',
					true
				)
			],
			edit_gist: hasGithubToken
				? [
						...Object.entries(gists).map(([key, gist]) =>
							enrichLink(
								{
									name: gist.name,
									icon: FileCode,
									href: `/admin?file=${gist.filename.replace(/\.json$/, '')}`
								},
								`edit_gist.${key}`,
								true
							)
						),
						enrichLink(
							{
								name: i18n.t('command.go_back'),
								icon: ArrowLeft,
								action: () => (currentGroup = null)
							},
							'command.go_back_edit_gist',
							true
						)
					]
				: [],
			screensaver: [
				enrichLink(
					{
						name: i18n.t('settings.screensaver_none'),
						icon: $screensaver === 'none' ? CircleCheck : Circle,
						action: () => {
							$screensaver = 'none';
							currentGroup = null;
						}
					},
					'settings.screensaver_none',
					true
				),
				enrichLink(
					{
						name: i18n.t('settings.screensaver_dvd'),
						icon: $screensaver === 'dvd' ? CircleCheck : Circle,
						action: () => {
							$screensaver = 'dvd';
							currentGroup = null;
						}
					},
					'settings.screensaver_dvd',
					true
				),
				enrichLink(
					{
						name: i18n.t('settings.screensaver_playlists'),
						icon: $screensaver === 'playlists' ? CircleCheck : Circle,
						action: () => {
							$screensaver = 'playlists';
							currentGroup = null;
						}
					},
					'settings.screensaver_playlists',
					true
				),
				enrichLink(
					{
						name: i18n.t('command.go_back'),
						icon: ArrowLeft,
						action: () => (currentGroup = null)
					},
					'command.go_back_screensaver',
					true
				)
			]
		};

		// Add Suggestions group if we have any tracked commands
		const allCommands = Object.values(config).flat();
		const suggestions = Object.entries($commandStats)
			.map(([id, stat]) => {
				const command = allCommands.find((c) => c.id === id);
				if (!command || !command.id) return null;
				// Scoring: count + recency bonus (linear decay over 7 days)
				const sevenDays = 7 * 24 * 60 * 60 * 1000;
				const recencyBonus = Math.max(0, 1 - (Date.now() - stat.lastUsed) / sevenDays) * 10;
				const score = stat.count + recencyBonus;
				return { command: { ...command, value: 'suggestion-' + command.value }, score };
			})
			.filter((s): s is { command: CommandData & { value: string }; score: number } => s !== null)
			.sort((a, b) => b.score - a.score)
			.slice(0, $suggestionsLimit)
			.map((s) => s.command);

		if (suggestions.length > 0) {
			return { suggestions, ...config };
		}

		return config;
	});

	// Collect all sub-group names referenced by command items (e.g. 'screensaver')
	const subGroups = $derived(
		Object.values(commandConfig).reduce((acc, commands) => {
			for (const cmd of commands) {
				if (cmd.group && !acc.includes(cmd.group)) {
					acc.push(cmd.group);
				}
			}
			return acc;
		}, [] as string[])
	);
</script>

{#snippet inputIcon()}
	{#if currentGroup}
		<button class="mb-1 mr-3 size-4 shrink-0 opacity-50" onclick={leaveCurrentGroup}>
			<ArrowLeft class="" />
		</button>
	{:else}
		<Search class="mr-2 size-4 shrink-0 opacity-50" />
	{/if}
{/snippet}

<Command.Dialog
	bind:open={$isCommandActive}
	bind:value={selectedCommandValue}
	shouldFilter={currentGroup !== 'notes'}
	onOpenChange={(open) => {
		if (!open) leaveCurrentGroup();
	}}
>
	<Command.Input
		bind:value={query}
		icon={inputIcon}
		placeholder={i18n.t('command.placeholder')}
		class="text-base"
	/>
	<Command.List>
		<Command.Empty>{i18n.t('command.no_results')}</Command.Empty>
		{#each Object.entries(commandConfig).filter(([group, commands]) => (commands.length && !currentGroup && !subGroups.includes(group)) || group === currentGroup) as [group, commands]}
			<Command.Group
				heading={i18n.t(`command.${group}`) !== `command.${group}`
					? i18n.t(`command.${group}`)
					: capitalize(group)}
			>
				{#each commands as command}
					<Command.Item onSelect={command.action} value={command.value} keywords={command.keywords}>
						{#if command.icon}
							<command.icon class={command.icon === LoaderCircle ? 'mr-2 animate-spin' : 'mr-2'} />
						{/if}
						<div class="min-w-0">
							<div class="truncate">{command.name}</div>
							{#if command.description}
								<div class="truncate text-xs text-muted-foreground">{command.description}</div>
							{/if}
						</div>
					</Command.Item>
				{/each}
				{#if group === 'links' && !currentGroup}
					{#each Object.entries(links)
						.filter(([name]) => !commands.some((c) => c.name.toLowerCase() === name.toLowerCase()))
						.map(([name, href]) => enrichLink({ name, href })) as command}
						<Command.Item
							onSelect={command.action}
							value={command.value}
							keywords={command.keywords}
						>
							<Link class="mr-2" />
							{capitalize(command.name)}
						</Command.Item>
					{/each}
				{/if}
			</Command.Group>
		{/each}
	</Command.List>
</Command.Dialog>

<Dialog.Root open={$showHelp} onOpenChange={(value) => ($showHelp = value)}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{i18n.t('command.shortcuts_title')}</Dialog.Title>
			<Dialog.Description>
				{i18n.t('command.shortcuts_description')}
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
