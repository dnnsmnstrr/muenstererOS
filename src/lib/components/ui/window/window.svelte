<!--
	Installed from @ieedan/shadcn-svelte-extras
-->

<script lang="ts" module>
	import type { WithChildren } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	export type WindowPropsWithoutHTML = WithChildren;

	export type WindowProps = HTMLAttributes<HTMLDivElement> & WindowPropsWithoutHTML;
</script>

<script lang="ts">
	import WindowButtons from '$lib/components/WindowButtons.svelte';
	import { cn } from '$lib/utils/utils';

	let { children, class: className }: WindowProps = $props();
</script>

<div class={cn('aspect-video w-full rounded-lg border border-border bg-background', className)}>
	<div class="border-b border-inherit p-1">
		<WindowButtons />
	</div>
	<div class="p-4">
		{@render children?.()}
	</div>
</div>
