<script lang="ts">
	import Heading from '$lib/components/typography/Heading.svelte';
	import { Card } from '$lib/components/ui/card';
	import { FIRST_NAME } from '$lib/config';

	const observations = [
		{ label: 'builds instead of buys', confidence: 97 },
		{ label: 'systems thinker', confidence: 94 },
		{ label: 'modular everything', confidence: 92 },
		{ label: 'plays by ear', confidence: 88 },
		{ label: 'indoor creature', confidence: 95 },
		{ label: 'shares freely', confidence: 89 },
		{ label: 'backup evangelist', confidence: 99 },
	];

	const artifacts = [
		{ icon: '🖨️', name: '2× CR6-SE', note: 'Klipper + Octoprint' },
		{ icon: '🎹', name: 'Piano', note: 'chords > sheet music' },
		{ icon: '👻', name: 'ThereMIDI', note: 'self-built' },
		{ icon: '🎮', name: 'Steam Deck', note: 'Portal, KSP, Astroneer' },
	];

	const quote = 'Kein Backup, kein Mitleid.';

	let hoveredIndex = $state<number | null>(null);
</script>

<svelte:head>
	<title>Lobster | muenstererOS</title>
	<meta name="description" content="Patty's observations" />
</svelte:head>

<div class="container mx-auto flex min-h-[70vh] flex-col items-center justify-center p-8">
	<Card class="max-w-md p-8">
		<Heading class="mb-2 text-2xl">Reading: {FIRST_NAME}</Heading>
		<p class="text-muted-foreground mb-6 text-sm">observed from the Zettelkasten 🍀</p>

		<div class="space-y-3">
			{#each observations as obs, i}
				<div
					class="group flex items-center gap-3"
					onmouseenter={() => (hoveredIndex = i)}
					onmouseleave={() => (hoveredIndex = null)}
				>
					<div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
						<div
							class="h-full rounded-full bg-primary transition-all duration-500"
							style="width: {hoveredIndex === i ? obs.confidence : obs.confidence * 0.7}%"
						></div>
					</div>
					<span
						class="w-36 text-sm transition-opacity duration-200 {hoveredIndex === i
							? 'opacity-100'
							: 'opacity-60'}"
					>
						{obs.label}
					</span>
					<span class="w-8 text-right font-mono text-xs text-muted-foreground">
						{obs.confidence}%
					</span>
				</div>
			{/each}
		</div>

		<div class="mt-8 grid grid-cols-2 gap-3">
			{#each artifacts as item}
				<div class="rounded-lg bg-muted/50 p-3 text-center">
					<div class="text-2xl">{item.icon}</div>
					<div class="text-sm font-medium">{item.name}</div>
					<div class="text-muted-foreground text-xs">{item.note}</div>
				</div>
			{/each}
		</div>

		<blockquote class="mt-8 border-l-2 border-primary pl-4 italic text-muted-foreground">
			"{quote}"
		</blockquote>

		<p class="text-muted-foreground mt-6 text-center text-xs">
			source: 111 notes · calibration: zettelkasten-derived
		</p>
	</Card>
</div>
