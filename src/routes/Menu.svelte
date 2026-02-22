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
	import { mode, toggleMode } from 'mode-watcher';
	import { showHelp } from '$lib/stores/app';
	import { i18n } from '$lib/i18n/i18n.svelte';

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
						{i18n.t('common.about')}
					</a>
				{/snippet}
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item>
				{#snippet child({ props })}
					<a href="/settings" {...props}>
						{i18n.t('common.settings')}... <Menubar.Shortcut>⌘,</Menubar.Shortcut>
					</a>
				{/snippet}
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item onclick={closeWindow}>
				{i18n.t('common.quit')}
				<Menubar.Shortcut>⌘Q</Menubar.Shortcut>
			</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>

	<Menubar.Menu>
		<Menubar.Trigger class="hidden lg:flex">{i18n.t('header.file')}</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>
				{#snippet child({ props })}
					<a href="/about" target="_blank" {...props}
						>{i18n.t('common.new_window')} <Menubar.Shortcut>⌘N</Menubar.Shortcut></a
					>
				{/snippet}
			</Menubar.Item>
			<Menubar.Item onclick={closeWindow}>
				{i18n.t('common.close_window')}
				<Menubar.Shortcut>⌘W</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item onclick={printPage}>
				{i18n.t('common.print')}
				<Menubar.Shortcut>⌘P</Menubar.Shortcut>
			</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>

	<Menubar.Menu>
		<Menubar.Trigger class="hidden lg:flex">{i18n.t('header.edit')}</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item disabled>
				{i18n.t('common.undo')}
				<Menubar.Shortcut>⌘Z</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Item disabled>
				{i18n.t('common.redo')}
				<Menubar.Shortcut>⇧⌘Z</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item disabled>
				{i18n.t('common.cut')}
				<Menubar.Shortcut>⌘X</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Item disabled>
				{i18n.t('common.copy')}
				<Menubar.Shortcut>⌘C</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Item disabled>
				{i18n.t('common.paste')}
				<Menubar.Shortcut>⌘V</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item onclick={() => document.execCommand('selectAll')}>
				{i18n.t('common.select_all')}
				<Menubar.Shortcut>⌘A</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Item disabled>
				{i18n.t('common.deselect_all')}
				<Menubar.Shortcut>⇧⌘A</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item onclick={() => (showPicker = true)}>
				{i18n.t('common.emoji_symbols')}{' '}
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
		<Menubar.Trigger class="hidden md:flex">{i18n.t('header.view')}</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item onclick={reloadPage}>
				{i18n.t('common.reload')}
				<Menubar.Shortcut>⌘R</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item onclick={toggleFullscreen}
				>{isBrowserInFullscreen()
					? i18n.t('common.exit_fullscreen')
					: i18n.t('common.enter_fullscreen')}
				<Menubar.Shortcut>⌘F</Menubar.Shortcut></Menubar.Item
			>
			<Menubar.Item onclick={toggleMode}>
				{$mode === 'dark' ? i18n.t('command.light_mode') : i18n.t('command.dark_mode')}
				<Menubar.Shortcut>^M</Menubar.Shortcut>
			</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>

	<Menubar.Menu>
		<Menubar.Trigger class="hidden sm:flex">{i18n.t('header.bookmarks')}</Menubar.Trigger>
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
		<Menubar.Trigger>{i18n.t('header.help')}</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item onclick={() => ($showHelp = !$showHelp)}>
				{i18n.t('command.keyboard_shortcuts')}
				<Menubar.Shortcut>?</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Link href={links.mailto} target="_blank">
				{i18n.t('common.contact')}
				<Menubar.Shortcut>@</Menubar.Shortcut>
			</Menubar.Link>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>

<Dialog.Root open={showPicker} onOpenChange={(value) => (showPicker = value)}>
	<Dialog.Content class="max-w-[340px] p-0" showClose={false}>
		<div id="docsearch"></div>
	</Dialog.Content>
</Dialog.Root>
