<!--
	Installed from @ieedan/shadcn-svelte-extras
-->

<script lang="ts">
	import { cn } from '$lib/utils/utils';
	import { onMount, onDestroy } from 'svelte';
	import { useAnimation } from './terminal.svelte.js';
	import type { TerminalAnimationProps } from './types';
	import { typewriter } from '$lib/actions/typewriter.svelte';

	// Add placeholder and onSubmit as props
	let {
		placeholder = "Type your command...",
        prompt = "$",
		onsubmit,
		delay = 0,
		class: className
	}: TerminalAnimationProps & { 
        placeholder?: string; 
        prompt?: string;
        onsubmit?: (value: string) => void;
    } = $props();

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
        // automatic focussing is handled in Command.svelte
	});

	onDestroy(() => animation.dispose());

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		inputValue = target.value;
	}

	function handleKeydown(e: KeyboardEvent) {
		inputEl && inputEl.focus();
		if (e.key === 'Enter') {
			onsubmit?.(inputValue);
			inputValue = '';
		}
	}
</script>


<div class="flex items-center">
    <span class="mr-2 hidden sm:block">{prompt}</span>
    <input
        class={cn('block bg-transparent outline-none text-base', className)}
        type="text"
        bind:value={inputValue}
        oninput={handleInput}
        onkeydown={handleKeydown}
        disabled={playAnimation}
        bind:this={inputEl}
        placeholder={placeholder}
    />
</div>
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
