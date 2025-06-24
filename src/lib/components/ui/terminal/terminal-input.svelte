<!--
	Installed from @ieedan/shadcn-svelte-extras
-->

<script lang="ts">
	import { cn } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import type { TerminalAnimationProps } from './types';

	let {
		class: className,
		placeholder = 'Type your command...',
		onsubmit,
        ontabcompletion,
        prompt = '$',
	}: TerminalAnimationProps & {
		placeholder?: string;
        prompt?: string;
		onsubmit?: (value: string) => void;
        ontabcompletion?: (value: string) => string[];
	} = $props();

	let inputEl: HTMLInputElement;
	let inputValue = $state('');


    onMount(() => {
		inputEl && inputEl.focus();
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
        else if (e.key === 'Tab') {
            e.preventDefault();
            const completions = ontabcompletion?.(inputValue);
            if (completions && completions.length > 0) {
                inputValue = inputValue.split(' ')[0] + ' ' + completions[0];
            }
        }
        else if (e.key === 'Escape') {
            inputValue = '';
        }
	}
</script>

<div class="flex items-center">
	<span class="mr-2 hidden sm:block">{prompt}</span>
	<input
		class={cn('block bg-transparent text-base outline-none', className)}
		type="text"
		bind:value={inputValue}
		oninput={handleInput}
		onkeydown={handleKeydown}
		bind:this={inputEl}
		{placeholder}
	/>
</div>
