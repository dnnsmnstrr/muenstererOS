<script lang="ts">
	import Heading from '$lib/components/typography/Heading.svelte';
	import { Card } from '$lib/components/ui/card';
	import { FIRST_NAME, PAGE_TITLE_SUFFIX } from '$lib/config';
	import { i18n } from '$lib/i18n/i18n.svelte';

	// Observations data with localized labels
	const observations = $derived([
		{ label: i18n.t('lobster.observations.builds'), confidence: 97 },
		{ label: i18n.t('lobster.observations.systems'), confidence: 94 },
		{ label: i18n.t('lobster.observations.modular'), confidence: 92 },
		{ label: i18n.t('lobster.observations.plays_by_ear'), confidence: 88 },
		{ label: i18n.t('lobster.observations.indoor'), confidence: 95 },
		{ label: i18n.t('lobster.observations.shares'), confidence: 89 },
		{ label: i18n.t('lobster.observations.backup'), confidence: 99 }
	]);

	// Artifacts data with localized notes
	const artifacts = $derived([
		{ icon: '🖨️', name: '2× CR6-SE', note: 'Klipper + Octoprint' },
		{ icon: '🎹', name: 'Piano', note: i18n.t('lobster.artifacts.piano_note') },
		{ icon: '👻', name: 'ThereMIDI', note: i18n.t('lobster.artifacts.theremidi_note') },
		{ icon: '🎮', name: 'Steam Deck', note: 'Portal, KSP, Astroneer' }
	]);

	// Localized quote and page metadata
	const quote = $derived(i18n.t('lobster.quote'));
	const pageTitle = $derived(i18n.t('lobster.title') + PAGE_TITLE_SUFFIX);
	const pageDescription = $derived(i18n.t('lobster.description'));

	let hoveredIndex = $state<number | null>(null);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<div class="container mx-auto flex min-h-[70vh] flex-col items-center justify-center p-8">
	<Card class="max-w-md p-8">
		<Heading class="mb-2 text-2xl">{i18n.t('lobster.reading', { name: FIRST_NAME })}</Heading>
		<p class="text-muted-foreground mb-6 text-sm">{i18n.t('lobster.observed_from')}</p>

		<div class="space-y-3">
			{#each observations as obs, i}
				<div
					role="listitem"
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
			{i18n.t('lobster.source', { count: '111' })} · {i18n.t('lobster.calibration')}
		</p>
	</Card>
</div>
