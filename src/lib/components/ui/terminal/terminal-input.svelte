<script lang="ts">
	import { cn } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import type { TerminalAnimationProps } from './types';

	let {
		class: className,
		placeholder = 'Type your command...',
		onsubmit,
        onkeydown,
        prompt = '$',
        autofocus = true
	}: TerminalAnimationProps & {
		placeholder?: string;
        prompt?: string;
        autofocus?: boolean;
		onsubmit?: (value: string) => void;
        onkeydown?: (event: KeyboardEvent, callback: (value: string) => void) => void;
	} = $props();

	let inputEl: HTMLInputElement;
	let inputValue = $state('');


    onMount(() => {
		autofocus && inputEl && inputEl.focus();
        // automatic focussing is handled in Command.svelte
	});

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
        else if (e.key === 'Escape') {
            inputValue = '';
        }
        else {
            onkeydown?.(e, (newValue: string) => inputValue = newValue);
        }
	}
</script>

<div class="flex items-center">
	<span class="mr-2 hidden sm:block whitespace-nowrap">{prompt}</span>
	<!-- svelte-ignore a11y_autofocus -->
	<input
        autofocus
		class={cn('flex bg-transparent text-base outline-none w-full', className)}
		type="text"
		bind:value={inputValue}
		oninput={handleInput}
		onkeydown={handleKeydown}
		bind:this={inputEl}
		{placeholder}
	/>
</div>
