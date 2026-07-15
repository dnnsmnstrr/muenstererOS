<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CommandPrimitive.ListProps = $props();
</script>

<CommandPrimitive.List
	data-command-list
	class={cn(
		'max-h-[35dvh] touch-pan-y overflow-y-auto overflow-x-hidden overscroll-contain sm:max-h-[300px]',
		className
	)}
	{...restProps}
	bind:ref
/>
