<script lang="ts">
	import { run } from 'svelte/legacy';

	import { spring } from 'svelte/motion';

	interface Props {
		visible?: boolean;
		children?: import('svelte').Snippet;
	}

	let { visible = false, children }: Props = $props();

	const offset = spring(0);
	run(() => {
		offset.set(visible ? 0 : 1);
	});
</script>

<div class="counter-viewport">
	<div class="counter-digits" style="transform: translate(0, {visible ? '' : '-'}{100 * $offset}%)">
		<strong class="hidden" aria-hidden="true"></strong>
		{@render children?.()}
	</div>
</div>

<style>

	svg {
		width: 25%;
		height: 25%;
	}

	path {
		vector-effect: non-scaling-stroke;
		stroke-width: 2px;
		stroke: #444;
	}

	.counter-viewport {
		width: 8em;
		height: 2em;
		overflow: hidden;
		text-align: center;
		position: relative;
	}

	.counter-viewport strong {
		position: absolute;
		display: flex;
		width: 100%;
		height: 100%;
		font-weight: 400;
		color: var(--color-theme-1);
		font-size: 4rem;
		align-items: center;
		justify-content: center;
	}

	.counter-digits {
		position: absolute;
		width: 100%;
		height: 100%;
	}
</style>
