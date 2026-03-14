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
		return Math.floor(((270 - r) % 360 + 360) % 360 / segmentAngle);
	});

	onMount(() => {
		return () => {
			if (momentumId) cancelAnimationFrame(momentumId);
		};
	});
</script>

<div class="relative w-full flex flex-col items-center pb-20">
	<!-- Wheel at the Top -->
	<div class="relative w-full h-[50vw] sm:h-[40vw] overflow-hidden pointer-events-none z-0 mb-8">
        <!-- Pointer/Arrow at the Top -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div class="w-0 h-0 border-l-[15px] sm:border-l-[30px] border-l-transparent border-r-[15px] sm:border-r-[30px] border-r-transparent border-t-[25px] sm:border-t-[50px] border-t-primary drop-shadow-2xl"></div>
        </div>

		<div
            bind:this={wheelElement}
            role="button"
            tabindex="0"
            aria-label="Wheel of Fortune"
            class="absolute top-0 left-1/2 aspect-square h-[100vw] sm:h-[80vw] cursor-grab active:cursor-grabbing touch-none select-none pointer-events-auto"
            style="transform: translateX(-50%) rotate({displayRotation}deg); transform-origin: center center;"
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
                    {@const groupAngle = i * segmentAngle}
                    <g transform="rotate({groupAngle} 50 50)">
                        <path
                            d="M 50 50 L 98 50 A 48 48 0 0 1 {50 + 48 * Math.cos(Math.PI * segmentAngle / 180)} {50 + 48 * Math.sin(Math.PI * segmentAngle / 180)} Z"
                            class={cn("stroke-border/10 transition-colors duration-300",
                                winningIndex === i ? "fill-primary/20" : (i % 2 === 0 ? "fill-muted" : "fill-card")
                            )}
                            stroke-width="0.2"
                        />
                        <text
                            transform="rotate({segmentAngle / 2} 50 50)"
                            x="95"
                            y="50"
                            text-anchor="end"
                            alignment-baseline="middle"
                            class={cn("text-[3px] sm:text-[4px] font-black transition-all duration-300 uppercase tracking-tighter",
                                winningIndex === i ? "fill-primary scale-110" : "fill-foreground/40"
                            )}
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

    <!-- Page Content -->
    <div class="w-full flex flex-col items-center text-center px-4">
        <div class="mb-4 sm:mb-8">
            <Heading>Slashes</Heading>
            <p class="max-w-md mx-auto opacity-80 mt-2 text-sm sm:text-base">
                This is a meta-collection of /slashes – a list of all my <Link href="https://slashpages.net/" target="_blank">slash pages</Link>.
                Spin the wheel or drag it!
            </p>
        </div>

        <div
            class={cn(
                "flex-1 flex flex-col items-center justify-center transition-all duration-300 w-full",
                isSpinning ? "opacity-20 scale-95" : "opacity-100 scale-100"
            )}
        >
            <div class="text-5xl sm:text-8xl font-black uppercase tracking-tighter text-primary break-all leading-none">
                {slashes[winningIndex].label}
            </div>
            {#if slashes[winningIndex].description}
                <p class="text-base sm:text-xl italic text-muted-foreground mt-4 max-w-lg mx-auto">
                    {slashes[winningIndex].description}
                </p>
            {/if}
        </div>

        <div class="pb-12 pt-8">
            <Button
                size="lg"
                onclick={spin}
                disabled={isSpinning}
                class="h-16 px-12 text-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
                {isSpinning ? 'Good Luck!' : 'SPIN'}
            </Button>
        </div>
    </div>
</div>
