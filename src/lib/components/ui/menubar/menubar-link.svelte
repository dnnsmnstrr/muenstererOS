<script lang="ts">
	import { Menubar as MenubarPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

    type LinkTarget = '_self' | '_blank' | '_parent' | '_top' | string;

	let {
		ref = $bindable(null),
		href = '',
        target = '',
		name = '',
		class: className,
		inset = undefined,
		children,
		...rest
	}: MenubarPrimitive.ItemProps & {
		href?: string;
		inset?: boolean;
        target?: LinkTarget
		name?: string;
	} = $props();
</script>

<a href={href || '/' + name.toLowerCase()} {target}>
	<MenubarPrimitive.Item
		bind:ref
		class={cn(
			'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50',
            inset && 'pl-8',
			className
		)}
		{...rest}
	>
		{#if name}
			<span>{name}</span>
        {:else}
            {@render children?.()}
		{/if}
	</MenubarPrimitive.Item>
</a>
