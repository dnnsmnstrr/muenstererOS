<script lang="ts">
	import { cn } from "$lib/utils/utils";
	import type { HTMLTdAttributes } from "svelte/elements";
	import TableHeadCell from "./TableHeadCell.svelte";

	interface Props extends HTMLTdAttributes {
		header?: boolean;
		align?: 'left' | 'center' | 'right' | 'justify' | 'char' | null | undefined;
	}

	let { class: className, children, header, align, ...restProps }: Props = $props();
</script>

{#if header}
	<TableHeadCell class={className} {align} {...restProps}>
		{@render children?.()}
	</TableHeadCell>
{:else}
	<td
		class={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
		{align}
		{...restProps}
	>
		{@render children?.()}
	</td>
{/if}
