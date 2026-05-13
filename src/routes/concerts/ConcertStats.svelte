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
		const counts: Record<number, { concerts: number; festivals: number; total: number }> = {};

		concerts.forEach((c: Concert) => {
			const year = new Date(c.date).getFullYear();
			if (!counts[year]) counts[year] = { concerts: 0, festivals: 0, total: 0 };
			counts[year].concerts++;
			counts[year].total++;
		});

		festivals.forEach((f: Festival) => {
			const year = f.year;
			if (!counts[year]) counts[year] = { concerts: 0, festivals: 0, total: 0 };
			counts[year].festivals++;
			counts[year].total++;
		});

		return Object.entries(counts)
			.map(([year, stat]) => ({ year: parseInt(year), ...stat }))
			.sort((a, b) => b.year - a.year);
	});

	let maxSeen = $derived(Math.max(...artistStats.map((s) => s.count), 1));
	let maxYearCount = $derived(Math.max(...yearStats.map((s) => s.total), 1));
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
					{#each yearStats as { year, total }}
						<div class="space-y-1">
							<div class="flex justify-between text-sm">
								<span>{year}</span>
								<span class="font-mono text-muted-foreground">{total}</span>
							</div>
							<div class="h-4 w-full overflow-hidden rounded-full bg-secondary">
								<div
									class="h-full bg-primary transition-all duration-500 ease-out"
									style="width: {(total / maxYearCount) * 100}%"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</Accordion.Content>
		</Accordion.Item>

		<Accordion.Item value="yearly-distribution">
			<Accordion.Trigger>{i18n.t('concerts.yearly_distribution')}</Accordion.Trigger>
			<Accordion.Content>
				<div class="flex h-64 items-end justify-between gap-2 border-b px-2 pt-4">
					{#each [...yearStats].reverse() as { year, concerts, festivals, total }}
						<div class="group relative flex h-full flex-1 flex-col items-center justify-end">
							<div
								class="flex w-full flex-col-reverse items-center justify-start overflow-hidden rounded-t-sm bg-secondary/30 transition-colors group-hover:bg-secondary/50"
								style="height: {Math.max((total / maxYearCount) * 100, 2)}%"
							>
								<div
									class="w-full bg-primary transition-all duration-500 hover:bg-primary/80"
									style="height: {(concerts / total) * 100}%"
									title="{year}: {concerts} {i18n.t('concerts.concerts')}"
								></div>
								<div
									class="w-full bg-primary/30 transition-all duration-500 hover:bg-primary/50"
									style="height: {(festivals / total) * 100}%"
									title="{year}: {festivals} {i18n.t('concerts.festivals')}"
								></div>
							</div>
							<span class="mt-2 text-[10px] font-medium text-muted-foreground sm:text-xs">
								{year.toString().slice(-2)}
							</span>

							<!-- Tooltip -->
							<div
								class="pointer-events-none absolute -top-12 left-1/2 z-10 -translate-x-1/2 scale-0 rounded bg-popover px-2 py-1 text-[10px] text-popover-foreground shadow-md transition-all group-hover:scale-100"
							>
								<p class="font-bold">{year}</p>
								<p>{concerts} C / {festivals} F</p>
							</div>
						</div>
					{/each}
				</div>
				<div class="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
					<div class="flex items-center gap-1">
						<div class="h-2 w-2 bg-primary"></div>
						<span>{i18n.t('concerts.concerts')}</span>
					</div>
					<div class="flex items-center gap-1">
						<div class="h-2 w-2 bg-primary/30"></div>
						<span>{i18n.t('concerts.festivals')}</span>
					</div>
				</div>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>
