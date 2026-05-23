<script lang="ts">
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
		}, 500);
	}
</script>

<div class={className} aria-label="gamepad" role="img" onmouseenter={handleMouseEnter}>
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
		class="gamepad-icon"
		class:animate={isHovered || animate}
	>
		<line x1="6" x2="10" y1="12" y2="12" />
		<line x1="8" x2="8" y1="10" y2="14" />
		<line x1="15" x2="15.01" y1="13" y2="13" />
		<line x1="18" x2="18.01" y1="11" y2="11" />
		<rect width="20" height="12" x="2" y="6" rx="2" />
	</svg>
</div>

<style>
	div {
		display: inline-block;
	}

	.gamepad-icon {
		transform-origin: center center;
		transition: transform 0.3s ease-in-out;
	}

	.gamepad-icon.animate {
		animation: bounce-gamepad 0.5s ease-in-out;
	}

	@keyframes bounce-gamepad {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4px);
		}
	}
</style>
