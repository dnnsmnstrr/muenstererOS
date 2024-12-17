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

	let isMobileMenuOpen = false;
	const bookmarks: Array<BookmarkItem[] | BookmarkItem> = [
		[
			{ name: 'Home', href: '/', icon: Home },
			{ name: 'About', href: '/about', icon: FileQuestion },
			{ name: 'Projects', href: '/projects', icon: LayoutGrid },
			{ name: 'Redirects', href: '/redirects', icon: Signpost },
			{ name: 'Settings', href: '/settings', icon: Settings },
			{ name: 'Legal Notice', href: '/legal', icon: Gavel }
		],
		{
			name: 'Social',
			sub: [
				{ name: 'Instagram', href: links.instagram, icon: Instagram },
				{ name: 'Twitter', href: links.twitter, icon: Twitter }
			]
		}
	];
</script>

<header class="flex justify-between gap-4">
	<nav class="hidden items-center sm:flex">
		<a href="/">
			<enhanced:img src="../../static/muenstererOS.png" alt="muenstererOS" class="w-8 min-w-6" />
		</a>
		<Menu />
	</nav>
	<nav class="flex items-center sm:hidden">
		<Sheet.Root open={isMobileMenuOpen} onOpenChange={(value) => (isMobileMenuOpen = value)}>
			<Sheet.Trigger>
				<Button variant="outline">
					<MenuIcon />
				</Button>
			</Sheet.Trigger>
			<Sheet.Content side="left" class="w-48">
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
											<Button
												href={bookmarkItem.href}
												class="w-full justify-start"
												variant="secondary"
												on:click={() => (isMobileMenuOpen = false)}
											>
												{#if bookmarkItem.icon}
													<!-- content here -->
													<svelte:component this={bookmarkItem.icon} class="mr-4 h-4 w-4" />
												{/if}

												{bookmarkItem.name}
											</Button>
										</ul>
									{/each}
									<Separator />
								{:else if bookmark.sub}
									<Heading depth={4}>{bookmark.name}</Heading>
									{#each bookmark.sub as bookmarkItem}
										<Button href={bookmarkItem.href} class="w-full" variant="secondary">
											{bookmarkItem.name}
										</Button>
									{/each}
								{:else}
									<Button href={bookmark.href} class="w-full" variant="secondary">
										{bookmark.name}
									</Button>
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
