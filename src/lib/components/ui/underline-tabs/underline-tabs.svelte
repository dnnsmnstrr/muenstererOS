<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { useUnderlineTabs } from './underline-tabs.svelte.js';
	import { box } from 'svelte-toolbelt';

	let {
		ref = $bindable(null),
		value = $bindable(''),
		id = crypto.randomUUID(),
		class: className,
		...restProps
	}: Omit<TabsPrimitive.RootProps, 'orientation' | 'id'> & { id?: string } = $props();

	useUnderlineTabs({
		value: box.with(
			() => value,
			(v) => (value = v)
		),
		id: box.with(() => id)
	});

	let {
		children,
		...rest
	} = restProps;
</script>

<TabsPrimitive.Root
	bind:ref
	bind:value
	orientation="horizontal"
	data-slot="underline-tabs"
	class={cn('flex flex-col gap-2', className)}
	{...rest}
>
	{@render children?.()}
</TabsPrimitive.Root>
