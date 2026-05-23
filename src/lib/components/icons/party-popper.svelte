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
		}, 600);
	}
</script>

<div class={className} aria-label="party popper" role="img" onmouseenter={handleMouseEnter}>
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
		class="party-popper-icon"
		class:animate={isHovered || animate}
	>
		<path d="M5.8 11.3 2 22l10.7-3.79" />
		<path d="M4 3h.01" />
		<path d="M22 8h.01" />
		<path d="M15 2h.01" />
		<path d="M22 20h.01" />
		<path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
		<path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17" />
		<path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7" />
		<path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
	</svg>

	<!-- Confetti pieces -->
	<div class="confetti-container" class:animate={isHovered || animate}>
		{#each [0, 1, 2, 3, 4, 5] as i (i)}
			<div class="confetti" style="--delay: {i * 0.05}s"></div>
		{/each}
	</div>
</div>

<style>
	div {
		display: inline-block;
		position: relative;
	}

	.party-popper-icon {
		transform-origin: center center;
		transition: transform 0.2s ease-out;
	}

	.party-popper-icon.animate {
		animation: pop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	@keyframes pop {
		0% {
			transform: scale(1) rotate(0deg);
		}
		50% {
			transform: scale(1.1) rotate(-5deg);
		}
		100% {
			transform: scale(1) rotate(5deg);
		}
	}

	.confetti-container {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.confetti {
		position: absolute;
		width: 4px;
		height: 4px;
		background: currentColor;
		border-radius: 50%;
		top: 0;
		left: 0;
		opacity: 0;
	}

	.confetti-container.animate .confetti {
		animation: confetti-burst 0.6s ease-out forwards;
	}

	.confetti:nth-child(1) {
		--angle: 45deg;
		--delay: 0s;
	}

	.confetti:nth-child(2) {
		--angle: 90deg;
		--delay: 0.05s;
	}

	.confetti:nth-child(3) {
		--angle: 135deg;
		--delay: 0.1s;
	}

	.confetti:nth-child(4) {
		--angle: 225deg;
		--delay: 0.05s;
	}

	.confetti:nth-child(5) {
		--angle: 270deg;
		--delay: 0s;
	}

	.confetti:nth-child(6) {
		--angle: 315deg;
		--delay: 0.05s;
	}

	@keyframes confetti-burst {
		0% {
			transform: translate(0, 0) scale(1);
			opacity: 1;
		}
		100% {
			transform: translate(calc(cos(var(--angle)) * 40px), calc(sin(var(--angle)) * 40px)) scale(0);
			opacity: 0;
		}
	}
</style>
