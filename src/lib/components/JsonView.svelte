<script lang="ts">
    import * as TreeView from '$lib/components/ui/tree-view';
    import JsonNode from '$lib/components/JsonNode.svelte';
	import { cn } from '$lib/utils';

    export let data = {};
</script>

<div class={cn("", $$props.class)}>
    <TreeView.Root>
        {#each Object.entries(data) as [key, value]}
            <JsonNode {key} {value} />
        {/each}
    </TreeView.Root>
</div>