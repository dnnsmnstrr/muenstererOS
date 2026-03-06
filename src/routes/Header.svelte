<script lang="ts">
	import {
		Home,
		Instagram,
		Settings,
		X,
		Gavel,
		TabletSmartphone,
		Icon,
		Download,
	} from 'lucide-svelte';

	import * as ContextMenu from '$lib/components/ui/context-menu';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
	import BatteryIndicator from '$lib/components/BatteryIndicator.svelte';
	import Menu, { type BookmarkItem } from './Menu.svelte';
	import CommandButton from '$lib/components/CommandButton.svelte';
	import { links } from '$lib/config';
	import MobileMenu from './MobileMenu.svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import HeaderLogo from '$lib/components/HeaderLogo.svelte';

	interface Props {
		pages?: BookmarkItem[];
	}

	let { pages = [] }: Props = $props();

	const bookmarks: Array<BookmarkItem | BookmarkItem[]> = $derived([
		[
			{ name: i18n.t('common.home'), href: '/', icon: Home },
			// { name: 'About', icon: FileQuestion },
		],
		{
			name: i18n.t('header.pages'),
			sub: pages
		},
		{
			name: i18n.t('header.social'),
			sub: [
				{ name: 'Instagram', href: links.instagram, icon: Instagram },
				{ name: 'Mastodon', href: links.mastodon },
				{ name: 'Twitter', href: links.twitter, icon: X },
			]
		},
		[
			{ name: i18n.t('common.settings'), href: '/settings', icon: Settings, hidden: true },
			{ name: i18n.t('common.legal'), href: '/legal', icon: Gavel },
		],
	]);


</script>

<header class="flex justify-between gap-4">
	<nav class="flex items-center sm:hidden">
		<MobileMenu {bookmarks} />
		<HeaderLogo />
	</nav>
	<nav class="hidden items-center sm:flex">
		<HeaderLogo />
		<Menu {bookmarks} />
	</nav>

	<div class="flex items-center gap-4">
		<div class="hidden sm:flex">
			<BatteryIndicator />
		</div>
		<CommandButton />
		<ModeToggle />
	</div>
</header>
