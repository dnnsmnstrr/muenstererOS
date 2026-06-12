<script lang="ts">
	import { onMount } from 'svelte';

	interface Airplane {
		id: number;
		x: number;
		y: number;
		targetX: number;
		targetY: number;
		duration: number;
		rotation: number;
		emoji: string;
	}

	let airplanes = $state<Airplane[]>([]);
	let nextId = 0;
	const timeouts = new Set<ReturnType<typeof setTimeout>>();

	const emojis = ['✈️', '🛩️', '🛫', '🛬'];

	function spawnAirplane() {
		const id = nextId++;
		const duration = Math.random() * 10000 + 5000; // 5-15 seconds
		const emoji = emojis[Math.floor(Math.random() * emojis.length)];

		// Start and end positions (percentage of container)
		const sides = ['top', 'right', 'bottom', 'left'];
		const startSide = sides[Math.floor(Math.random() * 4)];
		let endSide = sides[Math.floor(Math.random() * 4)];
		while (endSide === startSide) {
			endSide = sides[Math.floor(Math.random() * 4)];
		}

		let x, y, targetX, targetY;

		if (startSide === 'top') {
			x = Math.random() * 100;
			y = -10;
		} else if (startSide === 'bottom') {
			x = Math.random() * 100;
			y = 110;
		} else if (startSide === 'left') {
			x = -10;
			y = Math.random() * 100;
		} else {
			x = 110;
			y = Math.random() * 100;
		}

		if (endSide === 'top') {
			targetX = Math.random() * 100;
			targetY = -10;
		} else if (endSide === 'bottom') {
			targetX = Math.random() * 100;
			targetY = 110;
		} else if (endSide === 'left') {
			targetX = -10;
			targetY = Math.random() * 100;
		} else {
			targetX = 110;
			targetY = Math.random() * 100;
		}

		// Calculate rotation
		const dx = targetX - x;
		const dy = targetY - y;
		const rotation = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

		const airplane: Airplane = {
			id,
			x,
			y,
			targetX,
			targetY,
			duration,
			rotation,
			emoji
		};

		airplanes = [...airplanes, airplane];

		// Remove airplane after animation
		const timeout = setTimeout(() => {
			airplanes = airplanes.filter((a) => a.id !== id);
			timeouts.delete(timeout);
		}, duration);
		timeouts.add(timeout);
	}

	onMount(() => {
		const interval = setInterval(() => {
			if (airplanes.length < 5) {
				spawnAirplane();
			}
		}, 1000);

		return () => {
			clearInterval(interval);
			timeouts.forEach((t) => clearTimeout(t));
			timeouts.clear();
		};
	});
</script>

<div class="pointer-events-none absolute inset-0 z-[9999] overflow-hidden">
	{#each airplanes as airplane (airplane.id)}
		<div
			class="absolute text-2xl ease-linear"
			style="
                left: {airplane.x}%;
                top: {airplane.y}%;
                transform: rotate({airplane.rotation}deg);
                --target-x: {airplane.targetX}%;
                --target-y: {airplane.targetY}%;
                animation: fly {airplane.duration}ms linear forwards;
            "
		>
			{airplane.emoji}
		</div>
	{/each}
</div>

<style>
	@keyframes fly {
		to {
			left: var(--target-x);
			top: var(--target-y);
		}
	}
</style>
