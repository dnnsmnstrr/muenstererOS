<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
    import { Tween } from 'svelte/motion';

	interface Props {
		visible?: boolean;
		label?: string;
		duration?: number;
		children?: import('svelte').Snippet;
	}

	let { visible = false, label, duration = 350, children }: Props = $props();

    let offset = Tween.of(() => 0, { duration, easing: cubicInOut });
    $effect(() => {
        offset.set(visible ? 0 : 1, { duration, easing: cubicInOut });
    });
</script>

<div class="relative w-[8em] h-[2em] overflow-hidden text-center">
    <div class="absolute inset-0 w-full h-full" style="transform: translate(0, {visible ? '' : '-'}{100 * offset.current}%)">
        <strong class="sr-only" aria-hidden="true">{label || ''}</strong>
		{@render children?.()}
	</div>
</div>

