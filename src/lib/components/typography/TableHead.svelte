<script lang="ts">
	import { cn } from "$lib/utils/utils";
	import type { HTMLAttributes } from "svelte/elements";

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLTableSectionElement> = $props();
</script>

<thead class={cn("[&_tr]:border-b", className)} {...restProps}>
	{@render children?.()}
</thead>
