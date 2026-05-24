<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CommandPrimitive.ListProps = $props();
</script>

<CommandPrimitive.List
	class={cn("max-h-[40vh] sm:max-h-[300px] overflow-y-auto overflow-x-hidden overscroll-contain", className)}
	{...restProps}
	bind:ref
/>
