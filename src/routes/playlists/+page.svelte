<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	interface PlaylistItem {
		title: string;
		season: 'winter' | 'spring' | 'summer' | 'autumn';
		year: number;
		uri: string;
		emoji?: string;
		gif?: string;
	}
	const playlists: PlaylistItem[] = [
		{
			title: 'Warten',
			year: 2024,
			season: 'winter',
			uri: '5k4CrIEvYeNCg0go3BPR56',
			gif: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNG51MWo2c2d4aW04M2Rwa2w4MnI1NjU2NnN3Y2twZm51OXYzazFqNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/K3G6ZEHsbHKGnogFaP/giphy.gif',
		},
		{
			title: 'Wien / München / Köln / Leipzig',
			year: 2024,
			season: 'autumn',
			uri: '2BamYUcYazuRqudq38MX8Q',
			gif: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2M3emdlZHA2MTl1cnl3MWE3azJ6NHRna2RpZ3Fza2gzaTI2bGZycyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4P6JgvKB3KFWM/giphy.gif',
		},
		{
			title: 'Pools & Palm Trees',
			year: 2024,
			season: 'summer',
			uri: '7fKN8cSY9vaqQU3yEErWHk',
			gif: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjF3YXYxejYwOGk2ajdic2htbDV4b3RyMHVrbWM4eHBuejNvcHk1NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9xvjobE8fQedmw9f3i/giphy.gif',
		},
		{
			title: 'Still Blue',
			emoji: '🔵',
			year: 2024,
			season: 'spring',
			uri: '0RtPwbbEC1Okw9Zi2M5FBs',
			gif: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHkzczQ4cDNvMnJrcWpxZnBiM2QzdmVicmN2eTlrb2NobWRqOGI0cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1Az20wU0ArVMk/giphy.gif',
		},
	];

	const currentPlaylist = playlists[0]
</script>

<svelte:head>
	<title>Playlists</title>
</svelte:head>

<div class="container overflow-y-scroll p-4">
	<h1 class="mb-6 text-3xl font-bold">My Playlists</h1>

	<iframe title="Current Playlist" style="border-radius:12px" src="https://open.spotify.com/embed/playlist/{currentPlaylist.uri}" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6">
		{#each playlists as playlist}
			<Card.Root>
				<a href={'https://open.spotify.com/playlist/' + playlist.uri} target="_blank">
					<Card.Content class="pt-6">
						{#if playlist.gif}
							<img src={playlist.gif} alt="Playlist GIF" class="w-full aspect-square object-cover" />
						{/if}
						<h2 class="py-2 text-xl font-semibold">
							{#if playlist.emoji}
								{playlist.emoji}
							{/if}
							{playlist.title}
						</h2>
						<p class="text-muted-foreground">{playlist.year}</p>
					</Card.Content>
				</a>
			</Card.Root>
		{/each}
	</div>
</div>
