<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import Heading from '$lib/components/typography/Heading.svelte';
	import {
		Music,
		MapPin,
		Calendar,
		ExternalLink,
		Ticket,
		Star,
		Cloud,
		Turntable,
		Info,
		ChartBar
	} from 'lucide-svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import Link from '$lib/components/typography/Link.svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { formatDate } from '$lib/utils/helper';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Accordion from '$lib/components/ui/accordion';
	import * as Dialog from '$lib/components/ui/dialog';
	import ConcertStats from './ConcertStats.svelte';
	import type { PageProps } from './$types';
	import { Button } from '$lib/components/ui/button';

	let { data }: PageProps = $props();

	let activeTab = $state('concerts');
	let showStats = $state(false);

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

	let concerts = $derived(
		(data.concerts as Concert[]).sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		)
	);

	let festivals = $derived(
		(data.festivals as Festival[]).sort((a, b) => b.year - a.year || a.name.localeCompare(b.name))
	);

	function getMusicBrainzUrl(mbid: string) {
		return `https://musicbrainz.org/artist/${mbid}`;
	}
</script>

<svelte:head>
	<title>{i18n.t('concerts.title')}{PAGE_TITLE_SUFFIX}</title>
	<meta name="description" content={i18n.t('concerts.description')} />
</svelte:head>

<div class="container mx-auto p-4">
	<Tabs.Root bind:value={activeTab}>
		<div class="mb-4 flex w-full flex-col justify-between gap-2 sm:flex-row sm:items-start">
			<div class="flex flex-col gap-2">
				<Tabs.List class="w-fit border-none px-2 py-7">
					<Tabs.Trigger class="text-2xl" value="concerts"
						>{i18n.t('concerts.concerts')}</Tabs.Trigger
					>
					<Tabs.Trigger class="text-2xl" value="festivals"
						>{i18n.t('concerts.festivals')}</Tabs.Trigger
					>
				</Tabs.List>
				<p class="mb-4 text-muted-foreground">{i18n.t('concerts.description')}</p>
			</div>

			<div
				class="flex items-center justify-between gap-4 sm:flex-col-reverse sm:items-end sm:justify-end"
			>
				{#if data.updatedAt}
					<Link href={data.gistUrl} class="block text-xs font-normal text-muted-foreground">
						{i18n.t('concerts.last_updated')}
						{formatDate(data.updatedAt)}
					</Link>
				{/if}
				<Button variant="secondary" onclick={() => (showStats = true)}>
					<ChartBar class="mr-2 h-4 w-4" />
					{i18n.t('concerts.stats')}
				</Button>
			</div>
		</div>

		<Tabs.Content value="concerts">
			{#if concerts.length === 0}
				<div class="py-20 text-center">
					<p class="text-lg text-muted-foreground">{i18n.t('concerts.no_concerts')}</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each concerts as concert}
						<Card class="flex flex-col p-4">
							<div class="mb-2 flex items-start justify-between">
								<div class="flex items-center gap-2">
									{#if concert.type === 'festival'}
										<Ticket class="h-5 w-5 text-primary" />
									{:else if concert.type === 'open-air'}
										<Cloud class="h-5 w-5 text-primary" />
									{:else if concert.type === 'club'}
										<Turntable class="h-5 w-5 text-primary" />
									{:else}
										<Music class="h-5 w-5 text-primary" />
									{/if}
									<span
										class="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium uppercase text-secondary-foreground"
									>
										{i18n.t(`concerts.${concert.type}`) !== `concerts.${concert.type}`
											? i18n.t(`concerts.${concert.type}`)
											: concert.type.charAt(0).toUpperCase() + concert.type.slice(1)}
									</span>
								</div>
								{#if concert.rating}
									<div class="flex items-center gap-1 text-yellow-500">
										<Star class="h-4 w-4 fill-current" />
										<span class="text-sm font-bold">{concert.rating}</span>
									</div>
								{/if}
							</div>

							<Heading depth={2} class="mb-1 flex items-center gap-2 text-xl">
								{concert.artist}
								{#if concert.mbid}
									<div class="pt-2">
										<a href={getMusicBrainzUrl(concert.mbid)} target="_blank">
											<Info class="mb-1 h-3 w-3" />
										</a>
									</div>
								{/if}
							</Heading>

							<div class="mt-auto space-y-2">
								<div class="flex items-center text-sm text-muted-foreground">
									<Calendar class="mr-2 h-4 w-4" />
									{formatDate(concert.date)}
								</div>

								<div class="flex items-center text-sm text-muted-foreground">
									<MapPin class="mr-2 h-4 w-4" />
									{concert.venue}, {concert.location}
								</div>
							</div>
						</Card>
					{/each}
				</div>
			{/if}
		</Tabs.Content>
		<Tabs.Content value="festivals">
			<Card class="w-full px-3">
				{#if festivals.length === 0}
					<div class="py-20 text-center">
						<p class="text-lg text-muted-foreground">{i18n.t('concerts.no_concerts')}</p>
					</div>
				{:else}
					<Accordion.Root type="single" class="w-full">
						{#each festivals as festival}
							<Accordion.Item value={festival.name + festival.year} class="border-b">
								<Accordion.Trigger class="hover:no-underline">
									<div class="flex w-full items-center justify-between pr-4">
										<div class="flex items-center gap-3">
											<Ticket class="h-5 w-5 text-primary" />
											<div class="flex flex-col items-start">
												<span class="font-bold">{festival.name} {festival.year}</span>
												{#if festival.location}
													<span class="text-xs text-muted-foreground">{festival.location}</span>
												{/if}
											</div>
										</div>
										<div class="flex items-center gap-2">
											<span class="text-xs text-muted-foreground">
												{festival.artists.length === 1
													? i18n.t('concerts.artists_one')
													: i18n.t('concerts.artists_many', {
															count: festival.artists.length.toString()
														})}
											</span>
											{#if festival.url}
												<a
													href={festival.url}
													target="_blank"
													class="text-muted-foreground hover:text-primary"
													onclick={(e) => e.stopPropagation()}
												>
													<ExternalLink class="h-4 w-4" />
												</a>
											{/if}
										</div>
									</div>
								</Accordion.Trigger>
								<Accordion.Content>
									<div
										class="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
									>
										{#each festival.artists as artist}
											<div class="flex items-center gap-2 rounded-md bg-secondary/50 p-2 text-sm">
												<Music class="h-3 w-3 text-primary" />
												<span class="flex-1 truncate">{artist.name}</span>
												{#if artist.mbid}
													<a href={getMusicBrainzUrl(artist.mbid)} target="_blank">
														<Info class="h-3 w-3 text-muted-foreground hover:text-primary" />
													</a>
												{/if}
											</div>
										{/each}
									</div>
								</Accordion.Content>
							</Accordion.Item>
						{/each}
					</Accordion.Root>
				{/if}
			</Card>
		</Tabs.Content>
	</Tabs.Root>

	<Dialog.Root bind:open={showStats}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{i18n.t('concerts.stats')}</Dialog.Title>
				<Dialog.Description>
					{i18n.t('concerts.artist_frequency_description')}
				</Dialog.Description>
			</Dialog.Header>
			<ConcertStats concerts={data.concerts} festivals={data.festivals} />
		</Dialog.Content>
	</Dialog.Root>
</div>
