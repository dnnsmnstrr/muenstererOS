<!--
	Installed from @ieedan/shadcn-svelte-extras
-->

<script lang="ts">
	import { Window } from '$lib/components/ui/window';
	import { cn } from '$lib/utils/utils';
	import { useTerminalRoot } from './terminal.svelte.js';
	import { onMount } from 'svelte';
	import type { TerminalRootProps } from './types.js';

	let {
		delay = 0,
		speed = 1,
		onComplete = () => {},
		onMinimize = () => {},
		onMaximize = () => {},
		onClose = () => {},
		isMaximized = false,
		children,
		class: className
	}: TerminalRootProps & { isMaximized?: boolean } = $props();

	const terminal = useTerminalRoot({ delay, speed, onComplete });

	onMount(() => {
		// we play here so that we don't play before it is visible (on the server)
		terminal.play();

		return () => {
			terminal.dispose();
		};
	});
</script>

<Window
	class={cn('font-mono text-sm font-light', className)}
	{onClose}
	{onMinimize}
	{onMaximize}
	{isMaximized}
>
	{@render children?.()}
</Window>
