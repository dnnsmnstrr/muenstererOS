<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [color]
	 * @property {number} [size]
	 * @property {number} [strokeWidth]
	 * @property {string} [class]
	 * @property {boolean} [animate]
	 */

	/** @type {Props} */
	let {
		color = 'currentColor',
		size = 24,
		strokeWidth = 2,
		class: className = '',
		animate = false
	} = $props();

	let isHovered = $state(false);

	function handleMouseEnter() {
		isHovered = true;
		setTimeout(() => {
			isHovered = false;
		}, 1000);
	}
</script>

<div class={className} aria-label="list-checks" role="img" onmouseenter={handleMouseEnter}>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
		class="list-checks-icon"
		class:animate={isHovered || animate}
	>
		<path d="m3 17 2 2 4-4" class="check check-1" />
		<path d="m3 7 2 2 4-4" class="check check-2" />
		<path d="M13 6h8" />
		<path d="M13 12h8" />
		<path d="M13 18h8" />
	</svg>
</div>

<style>
	div {
		display: inline-block;
	}
	.check {
		transition: stroke-dashoffset 0.3s ease-in-out;
	}

	.animate .check-1 {
		animation: check-draw 0.5s forwards 0.3s;
	}
	.animate .check-2 {
		animation: check-draw 0.5s forwards;
	}

	@keyframes check-draw {
		from {
			opacity: 0;
			transform: translateX(-5px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
