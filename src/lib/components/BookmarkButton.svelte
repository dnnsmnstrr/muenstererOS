<script lang="ts">
	import type { BookmarkItem } from '../../routes/Menu.svelte';
	import { Button } from './ui/button';
	import { Icon } from 'lucide-svelte';
	import { elephantFace } from '@lucide/lab';
	interface Props {
		bookmark: BookmarkItem;
		onclick?: () => void;
	}

	let { bookmark, ...rest }: Props = $props();
</script>

<Button
	href={bookmark.href ?? '/' + (bookmark.name || '').toLowerCase()}
	class="w-full justify-start"
	variant="secondary"
	{...rest}
>
    {#if bookmark.icon}
	<bookmark.icon class="mr-4 h-4 w-4" />
    {:else if bookmark.name === 'Mastodon'}
		<Icon iconNode={elephantFace} class="mr-4 h-4 w-4" />
	{/if}
	{bookmark.name}
</Button>
