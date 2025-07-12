<script lang="ts">
	import { onMount } from 'svelte';
	import type { Event } from '$lib/types';
	import Loader from '$lib/components/Loader.svelte';
	import { formatDate, formatDuration } from '$lib/utils/helper';

	let events: Event[] = $state([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

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

	// Sort events by start date
	let sortedEvents = $derived(
		events.toSorted((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
	);
</script>

<svelte:head>
	<title>Life Timeline</title>
	<meta name="description" content="Interactive timeline of my life" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-bold">Live Timeline</h1>
		<p class="text-muted-foreground">A chronological view my life</p>
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
{:else if sortedEvents.length === 0}
	<div class="py-20 text-center">
		<p class="text-lg text-muted-foreground">No events found</p>
	</div>
{:else}
	<!-- Horizontal scrollable timeline -->
	<div class="">
		<!-- Timeline line -->
		<div
			class="absolute left-0 right-0 top-1/2 mt-24 z-0 h-0.5 -translate-y-1/2 transform bg-border"
		></div>

		<!-- Timeline container -->
		<div
			class="absolute inset-0 top-48 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 overflow-x-auto flex items-center"
		>
			<div class="flex min-w-max space-x-8 px-4 h-4/6 sm:max-h-80 sm:px-20">
				{#each sortedEvents as event, index}
					{@const duration = Math.round(
						new Date(event.endDate).getTime() - new Date(event.startDate).getTime()
					)}
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
										until {formatDate(event.endDate)} ({formatDuration(duration)})
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
