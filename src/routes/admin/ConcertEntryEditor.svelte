<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Plus, Trash2 } from 'lucide-svelte';

	let { value = $bindable('{}') } = $props();
	type Concert = {
		artist: string;
		mbid?: string;
		venue: string;
		location: string;
		date: string;
		type: string;
		rating?: number;
		notes?: string;
	};
	type Festival = {
		name: string;
		year: number;
		location?: string;
		url?: string;
		artists: { name: string; mbid?: string }[];
	};
	type ConcertData = { concerts: Concert[]; festivals: Festival[]; [key: string]: unknown };
	let data = $state<ConcertData>({ concerts: [], festivals: [] });

	$effect(() => {
		try {
			const parsed = JSON.parse(value || '{}');
			data = {
				...parsed,
				concerts: Array.isArray(parsed.concerts) ? parsed.concerts : [],
				festivals: Array.isArray(parsed.festivals) ? parsed.festivals : []
			};
		} catch {
			data = { concerts: [], festivals: [] };
		}
	});

	function commit() {
		value = JSON.stringify(data, null, 2);
	}

	function updateConcert(index: number, key: keyof Concert, next: string | number | undefined) {
		const concerts = [...data.concerts];
		concerts[index] = { ...concerts[index], [key]: next };
		data = { ...data, concerts };
		commit();
	}

	function updateFestival(
		index: number,
		key: keyof Festival,
		next: string | number | Festival['artists']
	) {
		const festivals = [...data.festivals];
		festivals[index] = { ...festivals[index], [key]: next };
		data = { ...data, festivals };
		commit();
	}

	function addConcert() {
		data = {
			...data,
			concerts: [
				{
					artist: '',
					venue: '',
					location: '',
					date: new Date().toISOString().slice(0, 10),
					type: 'concert'
				},
				...data.concerts
			]
		};
		commit();
	}

	function addFestival() {
		data = {
			...data,
			festivals: [{ name: '', year: new Date().getFullYear(), artists: [] }, ...data.festivals]
		};
		commit();
	}

	function setArtists(index: number, text: string) {
		const existing = data.festivals[index].artists;
		const byName = new Map(existing.map((artist) => [artist.name, artist]));
		const artists = text
			.split('\n')
			.map((name) => name.trim())
			.filter(Boolean)
			.map((name) => byName.get(name) ?? { name });
		updateFestival(index, 'artists', artists);
	}
</script>

<div class="space-y-8">
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-lg font-semibold">Concerts</h2>
				<p class="text-sm text-muted-foreground">{data.concerts.length} entries</p>
			</div>
			<Button variant="outline" size="sm" onclick={addConcert}
				><Plus class="mr-2 h-4 w-4" /> Add concert</Button
			>
		</div>
		{#each data.concerts as concert, index (index)}
			<div class="space-y-4 rounded-lg border p-4">
				<div class="flex items-center justify-between">
					<h3 class="font-medium">{concert.artist || 'New concert'}</h3>
					<Button
						variant="ghost"
						size="icon"
						class="text-destructive"
						aria-label="Delete concert"
						onclick={() => {
							data = { ...data, concerts: data.concerts.filter((_, i) => i !== index) };
							commit();
						}}><Trash2 class="h-4 w-4" /></Button
					>
				</div>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<div class="space-y-1.5">
						<Label>Artist</Label><Input
							value={concert.artist}
							oninput={(e) => updateConcert(index, 'artist', e.currentTarget.value)}
						/>
					</div>
					<div class="space-y-1.5">
						<Label>Date</Label><Input
							type="date"
							value={concert.date?.slice(0, 10) ?? ''}
							oninput={(e) => updateConcert(index, 'date', e.currentTarget.value)}
						/>
					</div>
					<div class="space-y-1.5">
						<Label>Type</Label><select
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
							value={concert.type}
							onchange={(e) => updateConcert(index, 'type', e.currentTarget.value)}
							>{#each ['concert', 'festival', 'open-air', 'club'] as type}<option value={type}
									>{type}</option
								>{/each}</select
						>
					</div>
					<div class="space-y-1.5">
						<Label>Venue</Label><Input
							value={concert.venue}
							oninput={(e) => updateConcert(index, 'venue', e.currentTarget.value)}
						/>
					</div>
					<div class="space-y-1.5">
						<Label>Location</Label><Input
							value={concert.location}
							oninput={(e) => updateConcert(index, 'location', e.currentTarget.value)}
						/>
					</div>
					<div class="space-y-1.5">
						<Label>MusicBrainz artist ID</Label><Input
							value={concert.mbid ?? ''}
							oninput={(e) => updateConcert(index, 'mbid', e.currentTarget.value)}
						/>
					</div>
					<div class="space-y-1.5">
						<Label>Rating (1–5)</Label><Input
							type="number"
							min="1"
							max="5"
							step="0.5"
							value={concert.rating ?? ''}
							oninput={(e) =>
								updateConcert(
									index,
									'rating',
									e.currentTarget.value === '' ? undefined : Number(e.currentTarget.value)
								)}
						/>
					</div>
					<div class="space-y-1.5 sm:col-span-2">
						<Label>Notes</Label><Textarea
							value={concert.notes ?? ''}
							oninput={(e) => updateConcert(index, 'notes', e.currentTarget.value)}
						/>
					</div>
				</div>
			</div>
		{:else}
			<p class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
				No concerts yet.
			</p>
		{/each}
	</section>

	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-lg font-semibold">Festivals</h2>
				<p class="text-sm text-muted-foreground">{data.festivals.length} entries</p>
			</div>
			<Button variant="outline" size="sm" onclick={addFestival}
				><Plus class="mr-2 h-4 w-4" /> Add festival</Button
			>
		</div>
		{#each data.festivals as festival, index (index)}
			<div class="space-y-4 rounded-lg border p-4">
				<div class="flex items-center justify-between">
					<h3 class="font-medium">{festival.name || 'New festival'} {festival.year}</h3>
					<Button
						variant="ghost"
						size="icon"
						class="text-destructive"
						aria-label="Delete festival"
						onclick={() => {
							data = { ...data, festivals: data.festivals.filter((_, i) => i !== index) };
							commit();
						}}><Trash2 class="h-4 w-4" /></Button
					>
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label>Name</Label><Input
							value={festival.name}
							oninput={(e) => updateFestival(index, 'name', e.currentTarget.value)}
						/>
					</div>
					<div class="space-y-1.5">
						<Label>Year</Label><Input
							type="number"
							step="1"
							value={festival.year}
							oninput={(e) => updateFestival(index, 'year', Number(e.currentTarget.value))}
						/>
					</div>
					<div class="space-y-1.5">
						<Label>Location</Label><Input
							value={festival.location ?? ''}
							oninput={(e) => updateFestival(index, 'location', e.currentTarget.value)}
						/>
					</div>
					<div class="space-y-1.5">
						<Label>Website URL</Label><Input
							type="url"
							value={festival.url ?? ''}
							oninput={(e) => updateFestival(index, 'url', e.currentTarget.value)}
						/>
					</div>
					<div class="space-y-1.5 sm:col-span-2">
						<Label>Artists (one per line)</Label><Textarea
							value={festival.artists.map((artist) => artist.name).join('\n')}
							oninput={(e) => setArtists(index, e.currentTarget.value)}
						/>
					</div>
				</div>
			</div>
		{:else}
			<p class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
				No festivals yet.
			</p>
		{/each}
	</section>
</div>
