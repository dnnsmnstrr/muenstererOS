<script lang="ts" module>
	import { Select as SelectPrimitive } from 'bits-ui';
	import type { WithoutChild } from '$lib/utils/utils.js';
	import type { ButtonSize, ButtonVariant } from '$lib/components/ui/button';

	export type SplitButtonSelectTriggerProps = WithoutChild<SelectPrimitive.TriggerProps> & {
		variant?: ButtonVariant;
		size?: ButtonSize;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { useSplitButtonRootCtx } from './split-button.svelte.js';
	import ChevronDownIcon from 'lucide-svelte/icons/chevron-down';

	let {
		ref = $bindable(null),
		class: className,
		variant = 'default',
		size = 'icon',
		disabled,
		children,
		...restProps
	}: SplitButtonSelectTriggerProps = $props();

	const root = useSplitButtonRootCtx();
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-slot="split-button-select-trigger"
	disabled={disabled || root.disabled}
	class={cn(buttonVariants({ variant, size }), className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<ChevronDownIcon />
	{/if}
</SelectPrimitive.Trigger>
