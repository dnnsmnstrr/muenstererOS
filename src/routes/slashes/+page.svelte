<script lang="ts">
	import Heading from "$lib/components/typography/Heading.svelte";
	import Link from "$lib/components/typography/Link.svelte";
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const slashes = [
		{ label: '/about', href: '/about', description: '' },
		{ label: '/contact', href: '/contact', description: 'how to reach me' },
		{ label: '/defaults', href: '/defaults', description: 'my main apps on iOS and macOS (more at defaults.rknight.me)' },
		{ label: '/interests', href: '/zettelkasten/interests', description: "what I'm interested in" },
		{ label: '/log', href: '/log', description: 'a changelog for this website' },
		{ label: '/now', href: '/now', description: "what i'm doing right now" },
		{ label: '/slashes', href: '/slashes', description: 'this page' },
		{ label: '/uses', href: '/uses', description: 'things I use' },
		{ label: '/where', href: '/where', description: "where I spend most of my time" }
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

	let startAngle = 0;
	let startRotation = 0;

	function handlePointerDown(e: PointerEvent) {
		if (isSpinning) return;
		if (momentumId) cancelAnimationFrame(momentumId);
		isDragging = true;
		startAngle = getAngle(e.clientX, e.clientY);
		startRotation = rotation;
		lastAngle = startAngle;
		lastTime = performance.now();
		velocity = 0;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const currentAngle = getAngle(e.clientX, e.clientY);
		const currentTime = performance.now();

		let deltaAngle = currentAngle - lastAngle;
		// Handle discontinuity at -180/180
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
		rotation += velocity * 16; // rough estimate for one frame
		velocity *= 0.95; // decay

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
		return Math.floor(((270 - r + segmentAngle / 2) % 360 + 360) % 360 / segmentAngle);
	});

	onMount(() => {
		return () => {
			if (momentumId) cancelAnimationFrame(momentumId);
		};
	});
</script>

<div class="fixed inset-0 overflow-hidden bg-background">
    <!-- Header/Nav remains visible but potentially overlaid -->
    <div class="absolute top-8 left-8 z-10 pointer-events-none">
        <Heading>Slashes</Heading>
        <div class="max-w-md opacity-80 pointer-events-auto">
			<p>
				This is a meta-collection of /slashes – a list of all my <Link href="https://slashpages.net/" target="_blank">slash pages</Link>.
				Spin the wheel or drag it!
			</p>
			{#if slashes[winningIndex].description}
				<p class="text-sm italic text-muted-foreground mt-2">
					{slashes[winningIndex].description}
				</p>
			{/if}
		</div>
    </div>

    <!-- Spin Button in Top Right -->
    <div class="fixed top-8 right-8 z-50">
        <Button
            size="lg"
            onclick={spin}
            disabled={isSpinning}
            class="h-16 px-12 text-xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
            {isSpinning ? 'Good Luck!' : 'SPIN'}
        </Button>
    </div>

	<!-- Full Screen Wheel Container -->
	<div class="absolute inset-0 flex items-end justify-center">
		<!-- Result Preview in the center of the screen -->
		<div
			class={cn(
				"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl sm:text-8xl font-black transition-all duration-300 uppercase tracking-tighter text-center z-0 pointer-events-none",
				isSpinning ? "opacity-20 scale-90" : "opacity-40 scale-110 text-primary"
			)}
		>
			{slashes[winningIndex].label}
		</div>

		<div class="relative w-[90vw] h-[45vw] sm:w-[80vw] sm:h-[40vw] max-w-[1200px] max-h-[600px]">
            <div class="absolute inset-0 overflow-hidden">
                <!-- Pointer/Arrow -->
                <div class="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                    <div class="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[50px] border-t-primary drop-shadow-2xl"></div>
                </div>

                <!-- Wheel -->
                <div
                    bind:this={wheelElement}
                    role="button"
                    tabindex="0"
                    aria-label="Wheel of Fortune"
                    class="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] h-[90vw] sm:w-[80vw] sm:h-[80vw] max-w-[1200px] max-h-[1200px] cursor-grab active:cursor-grabbing touch-none select-none"
                    style="transform: rotate({displayRotation}deg); transform-origin: center center;"
                    onpointerdown={handlePointerDown}
                    onpointermove={handlePointerMove}
                    onpointerup={handlePointerUp}
                    onpointercancel={handlePointerUp}
                    onkeydown={handleKeyDown}
                >
                    <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-2xl overflow-visible">
                        <circle cx="50" cy="50" r="49" class="fill-border" />
                        <circle cx="50" cy="50" r="48" class="fill-card" />

                        {#each slashes as slash, i}
                            {@const angle = i * segmentAngle}
                            <g transform="rotate({angle} 50 50)">
                                <path
                                    d="M 50 50 L {50 + 48 * Math.cos(Math.PI * -segmentAngle / 2 / 180)} {50 + 48 * Math.sin(Math.PI * -segmentAngle / 2 / 180)} A 48 48 0 0 1 {50 + 48 * Math.cos(Math.PI * segmentAngle / 2 / 180)} {50 + 48 * Math.sin(Math.PI * segmentAngle / 2 / 180)} Z"
                                    class={cn("stroke-border/10 transition-colors duration-300",
                                        winningIndex === i ? "fill-primary/20" : (i % 2 === 0 ? "fill-muted" : "fill-card")
                                    )}
                                    stroke-width="0.2"
                                />
                                <text
                                    x="95"
                                    y="50"
                                    text-anchor="end"
                                    alignment-baseline="middle"
                                    class={cn("text-[4px] font-black transition-all duration-300 uppercase tracking-tighter",
                                        winningIndex === i ? "fill-primary scale-110" : "fill-foreground/40"
                                    )}
                                    transform="rotate(0 95 50)"
                                >
                                    {slash.label.replace('/', '')}
                                </text>
                            </g>
                        {/each}

                        <!-- Center piece -->
                        <circle cx="50" cy="50" r="8" class="fill-card stroke-border shadow-inner" stroke-width="0.5" />
                        <circle cx="50" cy="50" r="3" class="fill-primary" />
                    </svg>
                </div>
            </div>
		</div>
	</div>

    <!-- Bottom Links -->
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 opacity-40 text-xs z-10 overflow-x-auto w-full px-4 flex justify-center pointer-events-none">
        <ul class="flex flex-wrap justify-center gap-6 whitespace-nowrap uppercase font-bold tracking-widest pointer-events-auto">
            {#each slashes as slash}
                <li><a href={slash.href} class="hover:underline hover:text-primary transition-colors">{slash.label}</a></li>
            {/each}
        </ul>
    </div>
</div>

<style>
	:global(body) {
		overflow: hidden;
	}
</style>
