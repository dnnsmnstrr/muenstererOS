<script lang="ts">
	import { get } from 'svelte/store';
	import { Binary, Braces, Brackets, Calendar, CaseLower, Link, SquareMinus, SquarePlus } from 'lucide-svelte';
	import * as TreeView from '$lib/components/ui/tree-view';
	import JsonNode from './JsonNode.svelte';

	const {
		key,
		value,
		type
	}: {
		key: string;
		value: any;
		type?: string;
	} = $props();
	let open = $state(false);
    console.log(key, value, type);
    
	function isObject(val: any) {
		return val && typeof val === 'object' && !Array.isArray(val);
	}

    function getValueType(val: any): string {
        if (isObject(val)) return 'object';
        if (Array.isArray(val)) return 'array';
        if (typeof val === 'string' && /^https?:\/\/\S+$/i.test(val)) return 'url';
        return typeof val;
    }
	let valueType = $derived(
		getValueType(value)
	);
</script>

{#if isObject(value) || Array.isArray(value)}
	<TreeView.Folder name={key + (value.title || value.name ? ` (${value.title || value.name})` : '')} bind:open>
		{#snippet icon()}
			{#if open}
				<SquareMinus class="size-4" />
			{:else}
				<SquarePlus class="size-4" />
			{/if}
		{/snippet}
		{#each Object.entries(value) as [k, v]}
			<JsonNode key={k} value={v} type={valueType} />
		{/each}
	</TreeView.Folder>
{:else}
	<TreeView.File name={`${key}: ${value}`} href={valueType === 'url' ? value : undefined}>
        >
		{#snippet icon()}
			{#if valueType === 'object'}
				<Braces class="size-3" />
			{:else if valueType === 'array'}
				<Brackets class="size-3" />
            {:else if valueType === 'url'}
				<Link class="size-3" />
			{:else if valueType === 'number'}
				<Binary class="size-3" />
            {:else if valueType === 'string' && !isNaN(Date.parse(value))}
                <Calendar class="size-3" />
			{:else}
				<CaseLower class="size-3" />
			{/if}
		{/snippet}
	</TreeView.File>
{/if}
