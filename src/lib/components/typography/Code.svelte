<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Check, Copy } from 'lucide-svelte';
	import { onDestroy } from 'svelte';

	let { node }: { node: import('mdast').Code } = $props();
	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function copyCode() {
		try {
			await navigator.clipboard.writeText(node.value);
			copied = true;
			clearTimeout(resetTimer);
			resetTimer = setTimeout(() => (copied = false), 2000);
		} catch (error) {
			console.error('Failed to copy code:', error);
		}
	}

	onDestroy(() => clearTimeout(resetTimer));
</script>

<div class="group relative my-6">
	<div class="absolute inset-x-2 top-2 flex h-7 items-center justify-between pl-2">
		<span
			class="select-none text-xs uppercase tracking-wide text-muted-foreground"
		>
			{node.lang || 'code'}
		</span>
		<Button
			variant="ghost"
			size="icon"
			class="size-7"
			onclick={copyCode}
			title={copied ? 'Copied' : 'Copy code'}
			aria-label={copied ? 'Code copied' : 'Copy code'}
		>
			{#if copied}<Check class="size-4" />{:else}<Copy class="size-4" />{/if}
		</Button>
	</div>
	<pre
		class="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 pt-12 text-sm leading-relaxed text-foreground"
	><code class={node.lang ? `language-${node.lang}` : undefined}>{node.value}</code></pre>
</div>
