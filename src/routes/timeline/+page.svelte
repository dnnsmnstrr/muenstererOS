<script lang="ts">
	import { onMount } from 'svelte';
	import type { Event } from '$lib/types';
	import Loader from '$lib/components/Loader.svelte';
	import { formatDate, formatDuration } from '$lib/utils/helper';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Calendar, Grid } from 'lucide-svelte';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import { BIRTHDATE, PAGE_TITLE_SUFFIX } from '$lib/config';

	let events: Event[] = $state([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let viewMode = $state<'timeline' | 'grid'>('timeline');
	let resolution = $state<'week' | 'month'>('week');
	let zoom = $state(12);
	let hoveredUnit = $state<(typeof gridUnits)[0] | null>(null);
	const targetAge = 80;

	const birthDate = $derived(new Date(BIRTHDATE));
	const now = new Date();

	const gridUnits = $derived.by(() => {
		const units = [];
		const totalUnits = resolution === 'week' ? targetAge * 52 : targetAge * 12;

		for (let i = 0; i < totalUnits; i++) {
			const unitDate = new Date(birthDate);
			if (resolution === 'week') {
				unitDate.setDate(birthDate.getDate() + i * 7);
			} else {
				unitDate.setMonth(birthDate.getMonth() + i);
			}

			const isPast = unitDate < now;
			const nextUnitDate = new Date(unitDate);
			if (resolution === 'week') {
				nextUnitDate.setDate(unitDate.getDate() + 7);
			} else {
				nextUnitDate.setMonth(unitDate.getMonth() + 1);
			}

			const activeEvents = parsedEvents.filter((event) => {
				return event.start < nextUnitDate && event.end >= unitDate;
			});

			units.push({
				date: unitDate,
				isPast,
				events: activeEvents
			});
		}
		return units;
	});

	onMount(async () => {
		try {
			const response = await fetch('/api/events');
			if (!response.ok) {
				throw new Error('Failed to fetch events');
			}
			const data = await response.json();
			events = data.events || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			loading = false;
		}
	});

	// Pre-parse event dates and sort events by start date
	let parsedEvents = $derived(
		events
			.map((event) => ({
				...event,
				start: new Date(event.startDate),
				end: new Date(event.endDate)
			}))
			.sort((a, b) => a.start.getTime() - b.start.getTime())
	);
</script>

<svelte:head>
	<title>{i18n.t('timeline.title')}{PAGE_TITLE_SUFFIX}</title>
	<meta name="description" content={i18n.t('timeline.description')} />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex flex-col gap-6">
		<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
			<div>
				<h1 class="mb-2 text-3xl font-bold">{i18n.t('timeline.title')}</h1>
				<p class="text-muted-foreground">{i18n.t('timeline.description')}</p>
			</div>

			<Tabs.Root value={viewMode} onValueChange={(v) => (viewMode = v as 'timeline' | 'grid')}>
				<Tabs.List>
					<Tabs.Trigger value="timeline" class="flex items-center gap-2">
						<Calendar class="h-4 w-4" />
						{i18n.t('timeline.timeline')}
					</Tabs.Trigger>
					<Tabs.Trigger value="grid" class="flex items-center gap-2">
						<Grid class="h-4 w-4" />
						{i18n.t('timeline.grid')}
					</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
		</div>

		{#if viewMode === 'grid'}
			<div class="flex flex-wrap items-center gap-6 border-t pt-4">
				<div class="flex items-center gap-3">
					<span class="text-sm font-semibold">{i18n.t('timeline.resolution')}:</span>
					<CustomSelect
						name="resolution"
						value={resolution}
						onValueChange={(v) => (resolution = v as 'week' | 'month')}
						options={[
							{ value: 'week', label: i18n.t('timeline.week') },
							{ value: 'month', label: i18n.t('timeline.month') }
						]}
						class="w-32"
					/>
				</div>

				<div class="flex items-center gap-3">
					<span class="text-sm font-semibold">{i18n.t('timeline.zoom')}:</span>
					<input
						type="range"
						min="4"
						max="32"
						bind:value={zoom}
						class="h-1.5 w-32 cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
					/>
				</div>
			</div>
		{/if}
	</div>
</div>
{#if loading}
	<div class="flex items-center justify-center py-20">
		<Loader />
	</div>
{:else if error}
	<div class="py-20 text-center">
		<p class="text-lg text-red-500">Error: {error}</p>
	</div>
{:else if parsedEvents.length === 0}
	<div class="py-20 text-center">
		<p class="text-lg text-muted-foreground">{i18n.t('timeline.no_events')}</p>
	</div>
{:else if viewMode === 'timeline'}
	<!-- Horizontal scrollable timeline -->
	<div class="">
		<!-- Timeline line -->
		<div
			class="absolute left-0 right-0 top-1/2 mt-24 z-0 h-0.5 -translate-y-1/2 transform bg-border"
		></div>

		<!-- Timeline container -->
		<div
			class="absolute inset-0 top-48 overflow-x-auto flex items-center scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
		>
			<div class="flex min-w-max space-x-8 px-4 h-4/6 sm:max-h-80 sm:px-20">
				{#each parsedEvents as event, index}
					{@const duration = Math.round(event.end.getTime() - event.start.getTime())}
					<div class="relative flex min-w-64 flex-col">
						<!-- Event card -->
						<div
							class="flex h-full max-w-64 flex-col items-center justify-between rounded-lg border bg-card p-4 text-center shadow-sm transition-shadow duration-200 hover:shadow-md"
							style="border-color: {event.color}; border-width: 1px;"
						>
							<h3 class="mb-2 line-clamp-3 text-lg font-semibold">{event.name}</h3>

							<div class="mb-3 text-sm text-muted-foreground">
								<div class="mb-1 flex items-center justify-center space-x-1">
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
									<span>{formatDate(event.startDate)}</span>
								</div>
								{#if event.endDate !== event.startDate}
									<div class="text-xs opacity-75">
										{i18n.t('timeline.until')}
										{formatDate(event.endDate)} ({formatDuration(duration)})
									</div>
								{/if}
							</div>

							{#if event.location}
								<div
									class="mb-3 flex items-center justify-center space-x-1 text-sm text-muted-foreground"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
									<span class="line-clamp-1">{event.location}</span>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<!-- Grid view -->
	<div class="container mx-auto px-4 pb-20">
		<div
			class="grid"
			style="grid-template-columns: repeat(auto-fill, {zoom}px); gap: {zoom > 8 ? 2 : 1}px;"
		>
			{#each gridUnits as unit}
				{@const primaryEvent = unit.events[0]}
				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<div
					role="presentation"
					onmouseover={() => (hoveredUnit = unit)}
					onmouseleave={() => (hoveredUnit = null)}
					onclick={() => (hoveredUnit = hoveredUnit === unit ? null : unit)}
					class="aspect-square rounded-[1px] border"
					style="
                        width: {zoom}px;
                        height: {zoom}px;
                        background-color: {primaryEvent?.color || 'transparent'};
                        opacity: {unit.isPast ? 1 : 0.2};
                        border-color: {primaryEvent ? 'rgba(0,0,0,0.2)' : 'var(--border)'};
                        {zoom < 6 ? 'border-width: 0;' : ''}
                    "
				></div>
			{/each}
		</div>
	</div>

	{#if hoveredUnit}
		<div
			class="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-lg border bg-card p-3 shadow-lg"
		>
			<div class="font-bold">{formatDate(hoveredUnit.date.toISOString())}</div>
			{#if hoveredUnit.events.length > 0}
				<div class="mt-2 flex flex-col gap-1">
					{#each hoveredUnit.events as event}
						<div class="flex items-center gap-2">
							<div class="h-2 w-2 rounded-full" style="background-color: {event.color}"></div>
							<div class="text-xs">{event.name}</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
{/if}

<style>
	.scrollbar-thin {
		scrollbar-width: thin;
	}

	.scrollbar-thumb-gray-400::-webkit-scrollbar-thumb {
		background-color: rgb(156, 163, 175);
	}

	.scrollbar-track-gray-100::-webkit-scrollbar-track {
		background-color: rgb(243, 244, 246);
	}

	::-webkit-scrollbar {
		height: 8px;
	}
</style>
