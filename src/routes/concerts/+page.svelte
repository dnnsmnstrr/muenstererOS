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
		Info
	} from 'lucide-svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import Link from '$lib/components/typography/Link.svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { formatDate } from '$lib/utils/helper';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

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

	let concerts = $derived(
		(data.concerts as Concert[]).sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		)
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
	<Heading class="mb-4 flex w-full items-center justify-between text-3xl">
		{i18n.t('concerts.title')}
		{#if data.updatedAt}
			<Link href={data.gistUrl} class="block text-sm font-normal">
				{i18n.t('concerts.last_updated')}
				{formatDate(data.updatedAt)}
			</Link>
		{/if}
	</Heading>

	<p class="mb-8 text-muted-foreground">{i18n.t('concerts.description')}</p>

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

					<Heading depth={2} class="mb-1 text-xl flex items-center gap-2">
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
</div>
