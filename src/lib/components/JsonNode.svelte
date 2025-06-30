<script lang="ts">
	import { Binary, Braces, Brackets, Calendar, CaseLower, SquareMinus, SquarePlus } from 'lucide-svelte';
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

	let valueType = $derived(
		isObject(value) ? 'object' : Array.isArray(value) ? 'array' : typeof value
	);
</script>

{#if isObject(value) || Array.isArray(value)}
	<TreeView.Folder name={key + (value.title ? ` (${value.title})` : '')} bind:open>
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
	<TreeView.File name={`${key}: ${value}`}>
		{#snippet icon()}
			{#if valueType === 'object'}
				<Braces class="size-3" />
			{:else if valueType === 'array'}
				<Brackets class="size-3" />
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
