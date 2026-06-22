<script lang="ts">
	import { cn } from "$lib/utils/utils";
	import type { HTMLTableAttributes } from "svelte/elements";

	let { class: className, children, ...restProps }: HTMLTableAttributes = $props();
</script>

<div class="relative w-full overflow-auto">
	<table
		class={cn("w-full caption-bottom text-sm", className)}
		{...restProps}
	>
		{@render children?.()}
	</table>
</div>
