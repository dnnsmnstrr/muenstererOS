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
		}, 1000);
	}
</script>

<div class={className} aria-label="calendar-days" role="img" onmouseenter={handleMouseEnter}>
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
		class="calendar-days-icon"
		class:animate={isHovered || animate}
	>
		<path d="M8 2v4" />
		<path d="M16 2v4" />
		<rect width="18" height="18" x="3" y="4" rx="2" />
		<path d="M3 10h18" />
		<path d="M8 14h.01" />
		<path d="M12 14h.01" />
		<path d="M16 14h.01" />
		<path d="M8 18h.01" />
		<path d="M12 18h.01" />
		<path d="M16 18h.01" />
	</svg>
</div>

<style>
	div {
		display: inline-block;
	}
	.calendar-days-icon {
		transform-origin: center center;
		transition: transform 0.3s ease-in-out;
	}

	.calendar-days-icon.animate {
		animation: bounce-calendar 0.5s ease-in-out;
	}

	@keyframes bounce-calendar {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4px);
		}
	}
</style>
