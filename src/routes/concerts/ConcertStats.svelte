<script lang="ts">
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { fade } from 'svelte/transition';
	import * as Accordion from '$lib/components/ui/accordion';

	interface Concert {
		artist: string;
		mbid?: string;
		venue: string;
		location: string;
		date: string;
		type: 'concert' | 'festival' | 'open-air' | 'club';
		rating?: number;
		notes?: string;
	}

	interface FestivalArtist {
		name: string;
		mbid?: string;
	}

	interface Festival {
		name: string;
		year: number;
		location?: string;
		url?: string;
		artists: FestivalArtist[];
	}

	let { concerts, festivals } = $props<{
		concerts: Concert[];
		festivals: Festival[];
	}>();

	let artistStats = $derived.by(() => {
		const counts: Record<string, number> = {};

		concerts.forEach((c: Concert) => {
			const name = c.artist;
			counts[name] = (counts[name] || 0) + 1;
		});

		festivals.forEach((f: Festival) => {
			f.artists.forEach((a: FestivalArtist) => {
				const name = a.name;
				counts[name] = (counts[name] || 0) + 1;
			});
		});

		return Object.entries(counts)
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, i18n.lang));
	});

	let yearStats = $derived.by(() => {
		const counts: Record<number, number> = {};

		concerts.forEach((c: Concert) => {
			const year = new Date(c.date).getFullYear();
			counts[year] = (counts[year] || 0) + 1;
		});

		festivals.forEach((f: Festival) => {
			const year = f.year;
			counts[year] = (counts[year] || 0) + 1;
		});

		return Object.entries(counts)
			.map(([year, count]) => ({ year: parseInt(year), count }))
			.sort((a, b) => b.year - a.year);
	});

	let maxSeen = $derived(Math.max(...artistStats.map((s) => s.count), 1));
	let maxYearCount = $derived(Math.max(...yearStats.map((s) => s.count), 1));
</script>

<div in:fade={{ duration: 300 }} class="space-y-6">
	<Accordion.Root type="single" value="artist-frequency">
		<Accordion.Item value="artist-frequency">
			<Accordion.Trigger>{i18n.t('concerts.artist_frequency')}</Accordion.Trigger>
			<Accordion.Content>
				<div class="max-h-[400px] space-y-4 overflow-y-auto pr-2">
					{#each artistStats as { name, count }}
						<div class="space-y-1">
							<div class="flex justify-between text-sm">
								<span>{name}</span>
								<span class="font-mono text-muted-foreground">{count}</span>
							</div>
							<div class="h-4 w-full overflow-hidden rounded-full bg-secondary">
								<div
									class="h-full bg-primary transition-all duration-500 ease-out"
									style="width: {(count / maxSeen) * 100}%"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</Accordion.Content>
		</Accordion.Item>

		<Accordion.Item value="yearly-frequency">
			<Accordion.Trigger>{i18n.t('concerts.yearly_frequency')}</Accordion.Trigger>
			<Accordion.Content>
				<div class="max-h-[400px] space-y-4 overflow-y-auto pr-2">
					{#each yearStats as { year, count }}
						<div class="space-y-1">
							<div class="flex justify-between text-sm">
								<span>{year}</span>
								<span class="font-mono text-muted-foreground">{count}</span>
							</div>
							<div class="h-4 w-full overflow-hidden rounded-full bg-secondary">
								<div
									class="h-full bg-primary transition-all duration-500 ease-out"
									style="width: {(count / maxYearCount) * 100}%"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>
