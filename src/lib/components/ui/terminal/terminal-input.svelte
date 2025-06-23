<!--
	Installed from @ieedan/shadcn-svelte-extras
-->

<script lang="ts">
	import { cn } from '$lib/utils/utils';
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { useAnimation } from './terminal.svelte.js';
	import type { TerminalAnimationProps } from './types';
	import { typewriter } from '$lib/actions/typewriter.svelte';

	const dispatch = createEventDispatcher();

	// Add placeholder and onSubmit as props
	let {
		placeholder = "Type your command...",
		onSubmit,
		children,
		delay = 0,
		class: className
	}: TerminalAnimationProps & { placeholder?: string; onSubmit?: (value: string) => void } = $props();

	let playAnimation = $state(false);
	let animationSpeed = $state(1);
	let inputValue = $state('');
	let inputEl: HTMLInputElement;

	const play = (speed: number) => {
		playAnimation = true;
		animationSpeed = speed;
	};
	const animation = useAnimation({ delay, play });

	onMount(() => {
		inputEl && inputEl.focus();
	});

	onDestroy(() => animation.dispose());
	onDestroy(() => animation.dispose());

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		inputValue = target.value;
	}

	function handleKeydown(e: KeyboardEvent) {
        inputEl && inputEl.focus();
		if (e.key === 'Enter') {
			onSubmit?.(inputValue);
			dispatch('submit', inputValue);
			inputValue = '';

        }
    }
</script>

<input
	class={cn('block bg-transparent outline-none', className)}
	type="text"
	{placeholder}
	bind:value={inputValue}
	oninput={handleInput}
	onkeydown={handleKeydown}
	disabled={playAnimation}
	bind:this={inputEl}
/>
{#if playAnimation}
	<span
		class={cn('block', className)}
		transition:typewriter={{
			speed: animationSpeed * 2,
			onComplete: () => animation.onComplete?.()
		}}
	>
		{inputValue}
	</span>
{/if}
