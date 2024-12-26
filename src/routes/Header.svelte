<script lang="ts">
	import {
		FileQuestion,
		Gavel,
		Home,
		Instagram,
		MenuIcon,
		LayoutGrid,
		Settings,
		Signpost,
		Twitter,
    ListMusic,
	} from 'lucide-svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Separator } from '$lib/components/ui/separator';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
	import BatteryIndicator from '$lib/components/BatteryIndicator.svelte';
	import Menu, { type BookmarkItem } from './Menu.svelte';
	import CommandButton from '$lib/components/CommandButton.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { WEBSITE_NAME, links } from '$lib/config';

	import Heading from '$lib/components/typography/Heading.svelte';
	import BookmarkButton from '$lib/components/BookmarkButton.svelte';

	let isMobileMenuOpen = false;
	const bookmarks: Array<BookmarkItem | BookmarkItem[]> = [
    [
        { name: 'Home', href: '/', icon: Home },
        { name: 'About', icon: FileQuestion },
        { name: 'Settings', icon: Settings },
        { name: 'Legal Notice', href: '/legal', icon: Gavel },
    ],
    {
      name: 'Pages',
      sub: [
        { name: 'Projects', icon: LayoutGrid },
        { name: 'Playlists', icon: ListMusic },
        { name: 'Redirects', icon: Signpost },
      ]
    },
		{
			name: 'Social',
			sub: [
				{ name: 'Instagram', href: links.instagram, icon: Instagram },
				{ name: 'Twitter', href: links.twitter, icon: Twitter },
        { name: 'Mastodon', href: links.mastodon },
			]
		}
	];
</script>

<header class="flex justify-between gap-4">
	<nav class="hidden items-center sm:flex">
		<a href="/">
			<enhanced:img src="../../static/muenstererOS.png" alt="muenstererOS" class="w-8 min-w-6" />
		</a>
		<Menu {bookmarks} />
	</nav>
	<nav class="flex items-center sm:hidden">
		<Sheet.Root open={isMobileMenuOpen} onOpenChange={(value) => (isMobileMenuOpen = value)}>
			<Sheet.Trigger>
				<Button variant="outline">
					<MenuIcon />
				</Button>
			</Sheet.Trigger>
			<Sheet.Content side="left" class="w-48 overflow-scroll">
				<Sheet.Header>
					<Sheet.Title class="py-2">
						<Heading depth={4}>
							{WEBSITE_NAME}
						</Heading>
					</Sheet.Title>
					<Sheet.Description>
						<div class="space-y-4">
							{#each bookmarks as bookmark}
								{#if Array.isArray(bookmark)}
									{#each bookmark as bookmarkItem}
										<ul>
                      <BookmarkButton bookmark={bookmarkItem} on:click={() => (isMobileMenuOpen = false)} />
										</ul>
									{/each}
									<Separator />
								{:else if bookmark.sub}
									<Heading depth={4}>{bookmark.name}</Heading>
									{#each bookmark.sub as bookmarkItem}
                    <BookmarkButton bookmark={bookmarkItem} on:click={() => (isMobileMenuOpen = false)} />
									{/each}
								{:else}
									<BookmarkButton {bookmark} on:click={() => (isMobileMenuOpen = false)} />
								{/if}
							{/each}
						</div>
					</Sheet.Description>
				</Sheet.Header>
			</Sheet.Content>
		</Sheet.Root>
	</nav>

	<div class="flex items-center gap-4">
		<div class="hidden sm:flex">
			<BatteryIndicator />
		</div>
		<CommandButton />
		<ModeToggle />
	</div>
</header>
