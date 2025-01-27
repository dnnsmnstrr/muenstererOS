<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Separator } from '$lib/components/ui/separator';
	import Button from '$lib/components/ui/button/button.svelte';
	import Heading from '$lib/components/typography/Heading.svelte';
	import BookmarkButton from '$lib/components/BookmarkButton.svelte';
	import { WEBSITE_NAME, links } from '$lib/config';
	import { MenuIcon } from 'lucide-svelte';
	import type { BookmarkItem } from './Menu.svelte';

	interface Props {
		bookmarks: Array<BookmarkItem | BookmarkItem[]>;
	}

	let { bookmarks }: Props = $props();
  let open = $state(false);
</script>

<Sheet.Root {open} onOpenChange={(value) => (open = value)}>
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
					{#each bookmarks as bookmark, index}
						{#if Array.isArray(bookmark)}
							{#each bookmark as bookmarkItem}
								<ul>
									<BookmarkButton
										bookmark={bookmarkItem}
										on:click={() => (open = false)}
									/>
								</ul>
							{/each}
              {#if index < bookmarks.length - 1}
                <Separator />
              {/if}
						{:else if bookmark.sub}
							<Heading depth={4}>{bookmark.name}</Heading>
							{#each bookmark.sub as bookmarkItem}
								<BookmarkButton
									bookmark={bookmarkItem}
									on:click={() => (open = false)}
								/>
							{/each}
              <Separator />
						{:else}
							<BookmarkButton {bookmark} on:click={() => (open = false)} />
						{/if}
					{/each}
				</div>
			</Sheet.Description>
		</Sheet.Header>
	</Sheet.Content>
</Sheet.Root>
