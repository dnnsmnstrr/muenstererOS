<script lang="ts">
	import Heading from '$lib/components/typography/Heading.svelte';
	import Link from '$lib/components/typography/Link.svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const slashes = [
		{ label: '/about', href: '/about', description: '' },
		{ label: '/contact', href: '/contact', description: 'how to reach me' },
		{
			label: '/defaults',
			href: '/defaults',
			description: 'my main apps on iOS and macOS (more at defaults.rknight.me)'
		},
		{ label: '/interests', href: '/zettelkasten/interests', description: "what I'm interested in" },
		{ label: '/log', href: '/log', description: 'a changelog for this website' },
		{ label: '/now', href: '/now', description: "what i'm doing right now" },
		{ label: '/slashes', href: '/slashes', description: 'this page' },
		{ label: '/uses', href: '/uses', description: 'things I use' },
		{ label: '/where', href: '/where', description: 'where I spend most of my time' },
		{ label: '/playlists', href: '/playlists', description: 'my favorite songs' }
	];

	let rotation = $state(0);
	let isSpinning = $state(false);
	let isDragging = $state(false);
	let wheelElement: HTMLElement | null = $state(null);

	const spinTween = new Tween(0, {
		duration: 4000,
		easing: cubicOut
	});

	let displayRotation = $derived(isSpinning ? spinTween.current : rotation);

	const segmentAngle = 360 / slashes.length;

	let lastAngle = 0;
	let lastTime = 0;
	let velocity = 0;
	let momentumId: number | null = null;

	function getAngle(x: number, y: number) {
		if (!wheelElement) return 0;
		const rect = wheelElement.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
	}

	function handlePointerDown(e: PointerEvent) {
		if (isSpinning) return;
		if (momentumId) cancelAnimationFrame(momentumId);
		isDragging = true;
		lastAngle = getAngle(e.clientX, e.clientY);
		lastTime = performance.now();
		velocity = 0;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const currentAngle = getAngle(e.clientX, e.clientY);
		const currentTime = performance.now();

		let deltaAngle = currentAngle - lastAngle;
		if (deltaAngle > 180) deltaAngle -= 360;
		if (deltaAngle < -180) deltaAngle += 360;

		const deltaTime = currentTime - lastTime;
		if (deltaTime > 0) {
			velocity = deltaAngle / deltaTime;
		}

		rotation += deltaAngle;
		lastAngle = currentAngle;
		lastTime = currentTime;
	}

	function handlePointerUp() {
		isDragging = false;
		if (Math.abs(velocity) > 0.01) {
			applyMomentum();
		}
	}

	function applyMomentum() {
		rotation += velocity * 16;
		velocity *= 0.95;
		if (Math.abs(velocity) > 0.01) {
			momentumId = requestAnimationFrame(applyMomentum);
		} else {
			momentumId = null;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			spin();
		}
	}

	async function spin() {
		if (isSpinning) return;
		if (momentumId) cancelAnimationFrame(momentumId);

		isSpinning = true;
		await spinTween.set(rotation, { duration: 0 });
		const extraRotations = 5 + Math.random() * 5;
		const targetRotation = rotation + extraRotations * 360;
		await spinTween.set(targetRotation);

		rotation = targetRotation % 360;
		isSpinning = false;

		const winner = slashes[winningIndex];
		if (winner.href !== '/slashes') {
			setTimeout(() => {
				goto(winner.href);
			}, 500);
		}
	}

	const winningIndex = $derived.by(() => {
		const r = displayRotation;
		// Pointer is at the top (270 degrees)
		return Math.floor(((((270 - r) % 360) + 360) % 360) / segmentAngle);
	});

	onMount(() => {
		return () => {
			if (momentumId) cancelAnimationFrame(momentumId);
		};
	});
</script>

<div class="relative flex w-full flex-col items-center pb-20">
	<div class="container mt-4 flex items-start justify-between gap-4 flex-row">

			<Heading>Slashes
                <p class="mt-2 max-w-md text-sm opacity-80 sm:text-base">
                    <Link href="https://slashpages.net/" target="_blank">my slash pages</Link>
                </p>
            </Heading>

		<Button
			onclick={spin}
			disabled={isSpinning}
			class="transition-all hover:scale-105 active:scale-95"
		>
			{isSpinning ? 'Good Luck!' : 'SPIN'}
		</Button>
	</div>

	<div class="flex w-full flex-col px-4 text-center min-h-60 min-h-48">
		<div
			class={cn(
				'flex w-full flex-1 flex-col items-center justify-center transition-all duration-300',
				isSpinning ? 'scale-95 opacity-20' : 'scale-100 opacity-100'
			)}
		>
			<div
				class="break-all text-5xl font-black uppercase leading-none tracking-tighter text-primary sm:text-8xl"
			>
				{slashes[winningIndex].label.replace('/', '')}
			</div>
			{#if slashes[winningIndex].description}
				<p class="mx-auto mt-4 max-w-lg text-base italic text-muted-foreground sm:text-xl">
					{slashes[winningIndex].description}
				</p>
			{/if}
		</div>
	</div>

	<!-- Wheel at the Top -->
	<div class="pointer-events-none relative z-0 mb-8 h-[50vw] w-full overflow-visible sm:h-[40vw]">
		<!-- Pointer/Arrow at the Top -->
		<div class="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2">
			<div
				class="h-0 w-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-primary drop-shadow-2xl sm:border-l-[30px] sm:border-r-[30px] sm:border-t-[50px]"
			></div>
		</div>

		<div
			bind:this={wheelElement}
			role="button"
			tabindex="0"
			aria-label="Wheel of Fortune"
			class="pointer-events-auto absolute left-1/2 top-0 aspect-square h-[100vw] cursor-grab touch-none select-none active:cursor-grabbing sm:h-[80vw]"
			style="transform: translateX(-50%) rotate({displayRotation}deg); transform-origin: center center;"
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			onpointercancel={handlePointerUp}
			onkeydown={handleKeyDown}
		>
			<svg viewBox="0 0 100 100" class="h-full w-full overflow-visible drop-shadow-2xl">
				<circle cx="50" cy="50" r="49" class="fill-border" />
				<circle cx="50" cy="50" r="48" class="fill-card" />

				{#each slashes as slash, i}
					{@const groupAngle = i * segmentAngle}
					{@const textAngle = segmentAngle / 2}
					<!-- Midpoint of the slice (local coordinates) -->
					{@const radius = 48}
					<!-- Radius of the circle -->
					{@const textRadius = radius * 0.7}
					{@const textX = 50 + textRadius * Math.cos((Math.PI * textAngle) / 180)}
					{@const textY = 50 + textRadius * Math.sin((Math.PI * textAngle) / 180)}

					<g transform="rotate({groupAngle} 50 50)">
						<path
							d="M 50 50 L 98 50 A 48 48 0 0 1 {50 +
								radius * Math.cos((Math.PI * segmentAngle) / 180)} {50 +
								radius * Math.sin((Math.PI * segmentAngle) / 180)} Z"
							class={cn(
								'stroke-border/10 transition-colors duration-300',
								i % 2 === 0 ? 'fill-muted' : 'fill-card'
							)}
							stroke-width="0.2"
						/>

						<text
							x={textX}
							y={textY}
							transform="rotate(17, 28, 0)"
							text-anchor="middle"
							alignment-baseline="middle"
							class={cn(
								'origin-center text-[4px] font-black uppercase tracking-tighter transition-all duration-300 sm:text-[5px]',
								winningIndex === i ? 'fill-primary' : 'fill-foreground'
							)}
						>
							{slash.label.replace('/', '')}
						</text>
					</g>
				{/each}

				<!-- Center piece -->
				<circle
					cx="50"
					cy="50"
					r="6"
					class="fill-card stroke-border shadow-inner"
					stroke-width="0.5"
				/>
				<circle cx="50" cy="50" r="2" class="fill-primary" />
			</svg>
		</div>
	</div>
</div>
