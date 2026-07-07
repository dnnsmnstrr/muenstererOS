<script lang="ts">
	import { Slider as SliderPrimitive, type WithElementRef } from "bits-ui";
	import { cn } from "$lib/utils/utils.js";

	let {
		ref = $bindable(null),
		value = $bindable([0]),
		class: className,
		type = "single",
		...restProps
	}: WithElementRef<SliderPrimitive.RootProps> = $props();
</script>

<!-- @svelte-ignore state_referenced_locally -->
<SliderPrimitive.Root
	bind:ref
	bind:value
	{type}
	class={cn("relative flex w-full touch-none select-none items-center", className)}
	{...restProps}
>
	{#snippet children({ thumbs })}
		<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
			<SliderPrimitive.Range class="absolute h-full bg-primary" />
		</span>
		{#each thumbs as thumb}
			<SliderPrimitive.Thumb
				index={thumb}
				class="border-primary bg-background ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	{/snippet}
</SliderPrimitive.Root>
