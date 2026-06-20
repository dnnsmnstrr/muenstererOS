<script lang="ts">
	import { cn } from "$lib/utils/utils";
	import type { HTMLThAttributes } from "svelte/elements";

	let { class: className, children, align, ...restProps }: HTMLThAttributes = $props();
</script>

<th
	class={cn(
		"h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
		className
	)}
	{align}
	{...restProps}
>
	{@render children?.()}
</th>
