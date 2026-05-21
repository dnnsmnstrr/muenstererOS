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
		}, 3000);
	}
</script>

<div class={className} aria-label="ship-wheel" role="img" onmouseenter={handleMouseEnter}>
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
		class="ship-wheel-icon"
		class:animate={isHovered || animate}
	>
		<circle cx="12" cy="12" r="8" />
		<path d="M12 2v4" />
		<path d="M12 18v4" />
		<path d="M4.93 4.93l2.83 2.83" />
		<path d="M16.24 16.24l2.83 2.83" />
		<path d="M2 12h4" />
		<path d="M18 12h4" />
		<path d="M4.93 19.07l2.83-2.83" />
		<path d="M16.24 7.76l2.83-2.83" />
	</svg>
</div>

<style>
	div {
		display: inline-block;
	}
	.ship-wheel-icon {
		transform-origin: center center;
		transition: transform 1s ease-in-out;
	}

	.ship-wheel-icon.animate {
		animation: rotate-wheel 3s ease-in-out;
	}

	@keyframes rotate-wheel {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(1080deg);
		}
	}
</style>
