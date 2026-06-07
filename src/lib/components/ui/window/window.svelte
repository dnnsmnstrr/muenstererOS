<!--
	Installed from @ieedan/shadcn-svelte-extras
-->

<script lang="ts" module>
	import type { WithChildren } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	export type WindowPropsWithoutHTML = WithChildren & {
		titlebarRight?: Snippet;
		titlebarCenter?: Snippet;
		childClassName?: string;
	};

	export type WindowProps = HTMLAttributes<HTMLDivElement> & WindowPropsWithoutHTML;
</script>

<script lang="ts">
	import WindowButtons from '$lib/components/WindowButtons.svelte';
	import { cn } from '$lib/utils/utils';
	import type { Snippet } from 'svelte';

	let {
		children,
		titlebarRight,
		titlebarCenter,
		onClose,
		onMinimize,
		onMaximize,
		isMaximized = false,
		class: className,
		childClassName,
		...rest
	}: WindowProps & {
		onClose?: () => void;
		onMinimize?: () => void;
		onMaximize?: () => void;
		isMaximized?: boolean;
	} = $props();
</script>

<div
	class={cn(
		'w-full flex flex-col rounded-lg border border-border bg-background transition-all duration-300',
		className
	)}
	{...rest}
>
	<div class="border-b border-inherit p-1 flex items-center justify-between gap-2">
		<WindowButtons {onClose} {onMinimize} {onMaximize} {isMaximized} />
		<div class="flex items-center">
			{@render titlebarCenter?.()}
		</div>
		<div class="flex items-center justify-end">
			{@render titlebarRight?.()}
		</div>
	</div>
	<div class={cn("p-4 flex-grow flex flex-col min-h-0", childClassName)}>
		{@render children?.()}
	</div>
</div>
