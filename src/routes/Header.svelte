<script lang="ts">
	import {
		FileQuestion,
		Home,
		Instagram,
		LayoutGrid,
		Settings,
		Signpost,
		X,
		ListMusic,
		Gavel,
		TabletSmartphone,
	} from 'lucide-svelte';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
	import BatteryIndicator from '$lib/components/BatteryIndicator.svelte';
	import Menu, { type BookmarkItem } from './Menu.svelte';
	import CommandButton from '$lib/components/CommandButton.svelte';
	import { links } from '$lib/config';
	import MobileMenu from './MobileMenu.svelte';
	import logo from '$lib/assets/muenstererOS.png';


	interface Props {
		pages?: BookmarkItem[];
	}

	let { pages = [] }: Props = $props();
	const bookmarks: Array<BookmarkItem | BookmarkItem[]> = [
		[
			{ name: 'Home', href: '/', icon: Home },
			{ name: 'About', icon: FileQuestion },
		],
		{
			name: 'Pages',
			sub: pages
		},
		{
			name: 'Social',
			sub: [
				{ name: 'Instagram', href: links.instagram, icon: Instagram },
				{ name: 'X / Twitter', href: links.twitter, icon: X },
				{ name: 'Mastodon', href: links.mastodon }
			]
		},
		[
			{ name: 'Settings', icon: Settings },
			{ name: 'Legal', href: '/legal', icon: Gavel },
		],
	];
</script>

<header class="flex justify-between gap-4">
	<nav class="flex items-center sm:hidden">
		<MobileMenu {bookmarks} />
		<a href="/" class="ml-4" aria-label="Home">
			<img src={logo} alt="muenstererOS" class="w-8 min-w-6" />
		</a>
	</nav>
	<nav class="hidden items-center sm:flex">
		<a href="/" aria-label="Home">
			<img src={logo} alt="muenstererOS" class="w-8 min-w-6" />
		</a>
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
