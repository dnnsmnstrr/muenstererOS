<script lang="ts">
	import buttons from '../../data/buttons.json';

	let { class: className = '' } = $props();

	// We double the buttons to create a seamless loop
	const doubledButtons = [...buttons, ...buttons];
</script>

<div class="marquee-container {className}">
	<div class="marquee-content">
		{#each doubledButtons as button}
			<a href={button.href} target="_blank" rel="noopener noreferrer" class="marquee-item">
				<img src={button.src} alt={button.alt} title={button.alt} class="h-8 w-[88px]" />
			</a>
		{/each}
	</div>
</div>

<style>
	.marquee-container {
		overflow: hidden;
		white-space: nowrap;
		width: 100%;
		mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
	}

	.marquee-content {
		display: inline-flex;
		gap: 1rem;
		animation: marquee 20s linear infinite;
	}

	.marquee-content:hover {
		animation-play-state: paused;
	}

	.marquee-item {
		flex-shrink: 0;
		transition: transform 0.2s ease-in-out;
	}

	.marquee-item:hover {
		transform: scale(1.1);
	}

	@keyframes marquee {
		0% {
			transform: translateX(0);
		}
		100% {
			/* Translate by half the width of the content (one set of buttons) */
			transform: translateX(calc(-50% - 0.5rem));
		}
	}
</style>
