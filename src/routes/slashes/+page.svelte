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
		return Math.floor(((270 - r + segmentAngle / 2) % 360 + 360) % 360 / segmentAngle);
	});

	onMount(() => {
		document.body.classList.add('overflow-hidden');
		return () => {
			document.body.classList.remove('overflow-hidden');
			if (momentumId) cancelAnimationFrame(momentumId);
		};
	});
</script>

<div class="fixed inset-0 overflow-hidden bg-background">
    <!-- Spin Button in Top Right -->
    <div class="fixed top-4 right-4 sm:top-8 sm:right-8 z-50">
        <Button
            size="lg"
            onclick={spin}
            disabled={isSpinning}
            class="h-10 px-6 sm:h-16 sm:px-12 text-sm sm:text-xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
            {isSpinning ? 'Good Luck!' : 'SPIN'}
        </Button>
    </div>

	<!-- Wheel at the Top -->
	<div class="absolute top-0 left-0 w-full h-[50vw] overflow-hidden flex justify-center pointer-events-none">
		<div class="relative w-screen h-[50vw] pointer-events-auto">
            <div class="absolute inset-0 overflow-hidden">
                <!-- Pointer/Arrow at the top edge -->
                <div class="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                    <div class="w-0 h-0 border-l-[15px] sm:border-l-[30px] border-l-transparent border-r-[15px] sm:border-r-[30px] border-r-transparent border-t-[25px] sm:border-t-[50px] border-t-primary drop-shadow-2xl"></div>
                </div>

                <!-- Wheel -->
                <div
                    bind:this={wheelElement}
                    role="button"
                    tabindex="0"
                    aria-label="Wheel of Fortune"
                    class="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-[100vw] cursor-grab active:cursor-grabbing touch-none select-none"
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
                                    class={cn("text-[3px] sm:text-[4px] font-black transition-all duration-300 uppercase tracking-tighter",
                                        winningIndex === i ? "fill-primary scale-110" : "fill-foreground/40"
                                    )}
                                    transform="rotate(0 95 50)"
                                    style="transform-box: fill-box; transform-origin: center;"
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
	</div>

    <!-- Info at the bottom -->
    <div class="absolute bottom-20 left-4 sm:bottom-24 sm:left-8 z-10 pointer-events-none">
        <Heading>Slashes</Heading>
        <div class="max-w-xs sm:max-w-md opacity-80 pointer-events-auto">
			<p class="text-xs sm:text-base">
				This is a meta-collection of /slashes – a list of all my <Link href="https://slashpages.net/" target="_blank">slash pages</Link>.
				Spin the wheel or drag it!
			</p>
			{#if slashes[winningIndex].description}
				<p class="text-[10px] sm:text-sm italic text-muted-foreground mt-1 sm:mt-2">
					{slashes[winningIndex].description}
				</p>
			{/if}
		</div>
    </div>

	<!-- Result Preview in the center of the remaining space -->
	<div
		class={cn(
			"absolute top-[65vh] left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl sm:text-8xl font-black transition-all duration-300 uppercase tracking-tighter text-center z-0 pointer-events-none",
			isSpinning ? "opacity-10 scale-90" : "opacity-30 scale-110 text-primary"
		)}
	>
		{slashes[winningIndex].label}
	</div>

    <!-- Bottom Links -->
    <div class="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 opacity-40 text-[8px] sm:text-xs z-10 overflow-x-auto w-full px-4 flex justify-center pointer-events-none">
        <ul class="flex flex-wrap justify-center gap-2 sm:gap-6 whitespace-nowrap uppercase font-bold tracking-widest pointer-events-auto">
            {#each slashes as slash}
                <li><a href={slash.href} class="hover:underline hover:text-primary transition-colors">{slash.label}</a></li>
            {/each}
        </ul>
    </div>
</div>
