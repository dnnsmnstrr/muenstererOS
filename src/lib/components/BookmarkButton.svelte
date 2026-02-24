<script lang="ts">
	import type { BookmarkItem } from '../../routes/Menu.svelte';
	import { Button } from './ui/button';

	interface Props {
		bookmark: BookmarkItem;
		onclick?: () => void;
	}

	let { bookmark, ...rest }: Props = $props();
</script>

<Button
	href={bookmark.href ?? '/' + (bookmark.name || '').toLowerCase()}
	class="w-full justify-{bookmark.icon ? 'start' : 'center'}"
	variant="secondary"
	{...rest}
>
    {#if bookmark.icon}
        <bookmark.icon class="mr-4 h-4 w-4" />
    {/if}
	{bookmark.name}
</Button>
