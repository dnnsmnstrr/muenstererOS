<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { node: import('mdast').Blockquote; children?: Snippet } = $props();
</script>

<blockquote
	class="my-6 border-l-2 border-primary pl-4 italic text-muted-foreground [&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
>
	{@render children?.()}
</blockquote>
