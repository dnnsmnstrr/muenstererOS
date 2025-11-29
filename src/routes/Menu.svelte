<script module lang="ts">
	export type BookmarkItem = {
		name: string;
		href?: string;
		sub?: BookmarkItem[];
		icon?: ConstructorOfATypedSvelteComponent;
		hidden?: boolean;
	};
</script>

<script lang="ts">
	import * as Menubar from '$lib/components/ui/menubar';
	import * as Dialog from '$lib/components/ui/dialog';
	import {
		closeWindow,
		isBrowserInFullscreen,
		printPage,
		reloadPage,
		toggleFullscreen
	} from '$lib/utils/index';
	import { WEBSITE_NAME, links } from '$lib/config';
	import { toggleMode } from 'mode-watcher';
	import { showHelp } from '$lib/stores/app';

	let showPicker = $state(false);
	interface Props {
		bookmarks?: Array<BookmarkItem | BookmarkItem[]>;
	}

	let { bookmarks = [] }: Props = $props();
</script>

<Menubar.Root class="rounded-none border-b border-none">
	<Menubar.Menu>
		<Menubar.Trigger class="font-bold">{WEBSITE_NAME}</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>
				{#snippet child({ props })}
					<a href="/about" {...props}>
						About
					</a>
				{/snippet}
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item>
				{#snippet child({ props })}
					<a href="/settings" {...props}>
						Settings... <Menubar.Shortcut>⌘,</Menubar.Shortcut>
					</a>
				{/snippet}
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item onclick={closeWindow}>
				Quit {WEBSITE_NAME}
				<Menubar.Shortcut>⌘Q</Menubar.Shortcut>
			</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>

	<Menubar.Menu>
		<Menubar.Trigger class="hidden lg:flex">File</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>
				{#snippet child({ props })}
					<a href="/about" target="_blank" {...props}>New Window <Menubar.Shortcut>⌘N</Menubar.Shortcut></a>
				{/snippet}
			</Menubar.Item>
			<Menubar.Item onclick={closeWindow}>
				Close Window <Menubar.Shortcut>⌘W</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item onclick={printPage}>
				Print... <Menubar.Shortcut>⌘P</Menubar.Shortcut>
			</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>

	<Menubar.Menu>
		<Menubar.Trigger class="hidden lg:flex">Edit</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item disabled>
				Undo <Menubar.Shortcut>⌘Z</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Item disabled>
				Redo <Menubar.Shortcut>⇧⌘Z</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item disabled>
				Cut <Menubar.Shortcut>⌘X</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Item disabled>
				Copy <Menubar.Shortcut>⌘C</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Item disabled>
				Paste <Menubar.Shortcut>⌘V</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item onclick={() => document.execCommand('selectAll')}>
				Select All <Menubar.Shortcut>⌘A</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Item disabled>
				Deselect All <Menubar.Shortcut>⇧⌘A</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item onclick={() => (showPicker = true)}>
				Emoji & Symbols{' '}
				<Menubar.Shortcut>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						class="h-4 w-4"
						viewBox="0 0 24 24"
					>
						<circle cx="12" cy="12" r="10" />
						<path
							d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
						/>
					</svg>
				</Menubar.Shortcut>
			</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>

	<Menubar.Menu>
		<Menubar.Trigger class="hidden md:flex">View</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item onclick={reloadPage}>
				Reload <Menubar.Shortcut>⌘R</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item onclick={toggleFullscreen}
				>{isBrowserInFullscreen() ? 'Exit' : 'Enter'} Full Screen <Menubar.Shortcut
					>⌘F</Menubar.Shortcut
				></Menubar.Item
			>
			<Menubar.Item onclick={toggleMode}>
				Toggle Dark Mode <Menubar.Shortcut>^M</Menubar.Shortcut>
			</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>

	<Menubar.Menu>
		<Menubar.Trigger class="hidden sm:flex">Bookmarks</Menubar.Trigger>
		<Menubar.Content>
			{#each bookmarks as bookmark, index}
				{#if Array.isArray(bookmark)}
					{#if index > 1}
						<Menubar.Separator />
					{/if}
					{#each bookmark as bookmarkItem}
						{#if !bookmarkItem.hidden}
							<Menubar.Link {...bookmarkItem} />
						{/if}
					{/each}
				{:else if bookmark.sub}
					<Menubar.Separator />
					<Menubar.Sub>
						<Menubar.SubTrigger>{bookmark.name}</Menubar.SubTrigger>
						<Menubar.SubContent>
							{#each bookmark.sub as bookmarkItem}
								{#if !bookmarkItem.hidden}
									<Menubar.Link {...bookmarkItem} />
								{/if}
							{/each}
						</Menubar.SubContent>
					</Menubar.Sub>
				{:else if !bookmark.hidden}
					<Menubar.Link {...bookmark} />
				{/if}
			{/each}
		</Menubar.Content>
	</Menubar.Menu>

	<Menubar.Menu>
		<Menubar.Trigger>Help</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item onclick={() => ($showHelp = !$showHelp)}>
				Keyboard Shortcuts <Menubar.Shortcut>?</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Link href={links.mailto} target="_blank">
				Contact <Menubar.Shortcut>@</Menubar.Shortcut>
			</Menubar.Link>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>

<Dialog.Root open={showPicker} onOpenChange={(value) => (showPicker = value)}>
	<Dialog.Content class="max-w-[340px] p-0" showClose={false}>
		<div id="docsearch"></div>
	</Dialog.Content>
</Dialog.Root>
