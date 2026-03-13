<script lang="ts">
	import Heading from "$lib/components/typography/Heading.svelte";
	import Link from "$lib/components/typography/Link.svelte";
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils/utils';

	const slashes = [
		{ label: '/about', href: '/about' },
		{ label: '/contact', href: '/contact' },
		{ label: '/defaults', href: '/defaults' },
		{ label: '/interests', href: '/zettelkasten/interests' },
		{ label: '/log', href: '/log' },
		{ label: '/now', href: '/now' },
		{ label: '/slashes', href: '/slashes' },
		{ label: '/uses', href: '/uses' },
		{ label: '/where', href: '/where' }
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

	function getAngle(x: number, y: number) {
		if (!wheelElement) return 0;
		const rect = wheelElement.getBoundingClientRect();
		// The wheel is a full circle, but only top half is shown.
		// The center of the circle is at the bottom center of the container.
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.bottom;
		return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
	}

	let startAngle = 0;
	let startRotation = 0;

	function handlePointerDown(e: PointerEvent) {
		if (isSpinning) return;
		isDragging = true;
		startAngle = getAngle(e.clientX, e.clientY);
		startRotation = rotation;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const currentAngle = getAngle(e.clientX, e.clientY);
		rotation = startRotation + (currentAngle - startAngle);
	}

	function handlePointerUp() {
		isDragging = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			spin();
		}
	}

	async function spin() {
		if (isSpinning) return;

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
</script>

<div class="container flex flex-col items-center h-full relative overflow-hidden max-w-4xl mx-auto px-4">
    <div class="text-center mt-8 mb-4 z-10">
        <Heading>Slashes</Heading>
        <p class="max-w-2xl mx-auto opacity-80">
			This is a meta-collection of /slashes – a list of all my <Link href="https://slashpages.net/" target="_blank">slash pages</Link>.
			Spin the wheel to find a random page!
		</p>
    </div>

	<div class="flex-grow flex flex-col items-center justify-end w-full relative min-h-[400px]">
		<!-- Result Preview -->
		<div
			class={cn(
				"mb-12 text-3xl sm:text-4xl font-black transition-all duration-300 uppercase tracking-tighter text-center",
				isSpinning ? "opacity-50 scale-90" : "opacity-100 scale-110 text-primary"
			)}
		>
			{slashes[winningIndex].label}
		</div>

		<div class="relative w-[300px] h-[150px] sm:w-[600px] sm:h-[300px]">
            <div class="absolute inset-0 overflow-hidden">
                <!-- Pointer/Arrow -->
                <div class="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                    <div class="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-primary drop-shadow-lg"></div>
                </div>

                <!-- Wheel -->
                <div
                    bind:this={wheelElement}
                    role="button"
                    tabindex="0"
                    aria-label="Wheel of Fortune"
                    class="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] cursor-grab active:cursor-grabbing touch-none select-none"
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
                                    x="46"
                                    y="50"
                                    text-anchor="end"
                                    alignment-baseline="middle"
                                    class={cn("text-[3.5px] font-bold transition-all duration-300 uppercase tracking-tight",
                                        winningIndex === i ? "fill-primary scale-110" : "fill-foreground/40"
                                    )}
                                    transform="rotate(0 46 50)"
                                >
                                    {slash.label.replace('/', '')}
                                </text>
                            </g>
                        {/each}

                        <!-- Center piece -->
                        <circle cx="50" cy="50" r="6" class="fill-card stroke-border shadow-inner" stroke-width="0.5" />
                        <circle cx="50" cy="50" r="2" class="fill-primary" />
                    </svg>
                </div>
            </div>
		</div>

		<div class="mt-12 mb-16 z-10">
			<Button
				size="lg"
				onclick={spin}
				disabled={isSpinning}
				class="h-16 px-12 text-xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
			>
				{isSpinning ? 'Good Luck!' : 'SPIN'}
			</Button>
		</div>
	</div>

    <div class="mb-8 opacity-40 text-[10px] sm:text-xs z-10 overflow-x-auto w-full px-4 flex justify-center">
        <ul class="flex flex-wrap justify-center gap-3 sm:gap-6 whitespace-nowrap uppercase font-bold tracking-widest">
            {#each slashes as slash}
                <li><a href={slash.href} class="hover:underline hover:text-primary transition-colors">{slash.label}</a></li>
            {/each}
        </ul>
    </div>
</div>

<style>
	/* Scoped styles to prevent layout issues without global body overflow hidden */
	.container {
		min-height: calc(100vh - 200px);
	}
</style>
