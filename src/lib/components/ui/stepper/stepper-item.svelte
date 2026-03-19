<script lang="ts">
	import { cn } from '$lib/utils';
	import { useStepperItem } from './stepper.svelte.js';
	import type { StepperItemProps } from './types';

	let { id, class: className, children, ...rest }: StepperItemProps = $props();

	id = id ?? crypto.randomUUID();

	const stepperItemState = useStepperItem({ id });
</script>

<div
	data-slot="stepper-item"
	class={cn(
		'group/stepper-item relative flex',
		{
			'flex-1': !stepperItemState.isLast
		},
		className
	)}
	{...stepperItemState.props}
	{...rest}
>
	{@render children?.()}
</div>
