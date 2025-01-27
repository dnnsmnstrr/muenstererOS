<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";

	type $$Props = MenubarPrimitive.ItemProps & {
		inset?: boolean;
	};
	type $$Events = MenubarPrimitive.ItemEvents;

	interface Props {
		class?: $$Props["class"];
		inset?: $$Props["inset"];
		name?: string;
		href?: string;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		class: className = undefined,
		inset = undefined,
		name = '',
		href = '',
		children,
		...rest
	}: Props = $props();
	
</script>

<MenubarPrimitive.Item
	class={cn(
		"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		inset && "pl-8",
		className
	)}
  href={href || "/" + name.toLocaleLowerCase()}
	{...rest}
	on:click
	on:keydown
	on:focusin
	on:focusout
	on:pointerleave
	on:pointermove
	on:pointerdown
>
  {#if name}
    <span>{name}</span>
  {/if}
	{@render children?.()}
</MenubarPrimitive.Item>
