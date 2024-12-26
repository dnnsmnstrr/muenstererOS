<script lang="ts">
	import type { BookmarkItem } from '../../routes/Menu.svelte';
	import { Button } from './ui/button';

	export let bookmark: BookmarkItem;
</script>

<Button
	href={bookmark.href || '/' + (bookmark.name || '').toLowerCase()}
	class="w-full justify-{bookmark.icon ? 'start' : 'center'}"
	variant="secondary"
	on:click
>
    {#if bookmark.icon}
        <svelte:component this={bookmark.icon} class="mr-4 h-4 w-4" />
    {/if}
	{bookmark.name}
</Button>
