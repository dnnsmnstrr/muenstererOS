<script lang="ts">
	let { node }: { node: import('mdast').Html } = $props();
</script>

<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{node.value}</code>
