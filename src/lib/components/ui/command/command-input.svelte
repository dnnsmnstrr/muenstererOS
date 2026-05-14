<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import Search from "lucide-svelte/icons/search";
	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(""),
		icon,
		...restProps
	}: CommandPrimitive.InputProps & { icon?: import("svelte").Snippet } = $props();
</script>

<div class="flex items-center border-b px-2" data-command-input-wrapper="">
	{#if icon}
		{@render icon()}
	{:else}
		<Search class="mr-2 size-4 shrink-0 opacity-50" />
	{/if}
	<CommandPrimitive.Input
		class={cn(
			"placeholder:text-muted-foreground flex h-11 w-full rounded-md bg-transparent py-3 text-base outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
			className
		)}
		bind:ref
		{...restProps}
		bind:value
	/>
</div>
