<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	data-slot="stepper-indicator"
	class={cn(
		'z-1 text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full bg-primary ring-3 ring-background transition-colors select-none [&_svg]:size-4',
		'group-data-[state=inactive]/stepper-trigger:bg-muted group-data-[state=inactive]/stepper-trigger:text-muted-foreground',
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>
