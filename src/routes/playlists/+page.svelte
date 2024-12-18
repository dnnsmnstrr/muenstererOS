<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { capitalize } from '$lib/helper';
	interface PlaylistItem {
		title: string;
		season?: 'winter' | 'spring' | 'summer' | 'autumn';
		year?: number;
		uri: string;
		emoji?: string;
		description?: string;
		gif?: string;
		imageId?: string;
	}
	const SPOTIFY_PLAYLIST_LINK = 'https://open.spotify.com/playlist/'
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
		{
			title: 'Monsters',
			year: 2023,
			season: 'winter',
			emoji: '👹',
			uri: '3tes9ptMPMRmiR4HFcqk4J',
			imageId: 'ab67706c0000da84d5f914c118f5bfaacaf7e81a'
		},
		{
			title: 'Regen',
			emoji: '🌧️',
			year: 2023,
			season: 'autumn',
			uri: '2BamYUcYazuRqudq38MX8Q',
			imageId: 'ab67706c0000da8482bdfe8492e17ebe3277359f',
			gif: 'https://media4.giphy.com/media/G3lxvBMhGu53y/giphy.webp'
		},
		{
			title: 'summer pt. ii',
			year: 2023,
			season: 'summer',
			uri: '6vv0k98f8LOdER20fGDk6T',
			imageId: 'ab67706c0000da84190c48db823c4f0bdfe11b60'
		},
		{
			title: 'Take it off',
			emoji: '🧑‍🚀',
			year: 2023,
			season: 'spring',
			uri: '1w9orNgLp1zrOXxt5dAURP',
			imageId: 'ab67706c0000da84ee11e38c63e5e4562e8cdf79'
		},
	];

	const currentPlaylist = playlists[0]
	const otherPlaylists: Record<string, PlaylistItem> = {
		"spring": {
			uri: "68z163CKUImi0QB6ZpSigr",
			title: 'Spring',
			description: 'All songs from my spring playlists',
			emoji: '🌼',
		},
		"summer": {
			uri: "5wpb3PdQOzFb3jurTcVfZO",
			title: 'Summer',
			description: 'All songs from my summer playlists',
			emoji: '☀️',
		},
		"autumn": {
			uri: "22XncHS02W5RWJ1yM4lV6l",
			title: 'Autumn',
			description: 'All songs from my autumn playlists',
			emoji: '🍂',
		},
		"winter": {
			uri: "67SvJfEofXhdIXwsuUJbCJ",
			title: 'Winter',
			description: 'All songs from my winter playlists',
			emoji: '❄️',
		},
		"chill": {
			uri: "0x0ZQcmLsamIx5bF5px2Tc",
			title: 'Sloth Mode',
			description: 'Songs to Relax to',
			emoji: '🦥',
		},
		"sleep": {
			uri: "13RQxSzWqVg3fHlalxlyhC",
			title: 'Milk of the Poppy',
			description: 'Songs to fall asleep to',
			emoji: '🛌',
		},
		"coding": {
			uri: "0camicGxGNwB9YS66nAwtb",
			title: '1337 h4xX0r',
			emoji: '🖥  ⌨️🖱',
			description: 'Songs to code to',
		},
		"sports": {
			uri: "4X1uZRUIccnwcofS8QjBku",
			title: '',
			description: 'Songs to run to',
			emoji: '🏃‍➡️',
		},
		"meme": {
			uri: "4HvN65IMe9oEWqMl1zHCIE",
			title: 'Memeology',
			description: 'Songs that became a meme',
			emoji: '🐸',
		},
		"party": {
			uri: "1E5n3EWqT9MDPUb1qvGjsb",
			title: 'Partytime',
			description: 'Songs to party to',
			emoji: '🎉',
		},
		"night": {
			uri: "2OHb3F8gQqQY4hb14p2uoe",
			title: 'Latenite',
			description: 'Songs to get through a long night',
			emoji: '🌃',
		},
		"morning": {
			uri: "6FhnyDVlq5Az6Bllb7einR",
			title: 'the morning after',
			description: 'Songs to cure your hangover',
			emoji: '🌅',
		},
		"piano": {
			uri: "5w86GPXC86kKEpbLSKVxFS",
			title: 'Piano',
			description: 'Songs I can play on the piano',
			emoji: '🎹',
		},
		"clean": {
			uri: "5idv5XxAwr7q9u4hyWNaNH",
			title: 'Blitzblank',
			description: 'Songs to clean your house to',
			emoji: '🧹',
		},
		"cook": {
			uri: "66wQsRoITiTV5xeG6T19wH",
			title: 'Cooking Inspo',
			description: 'Songs to get your taste buds ready',
			emoji: '🧑‍🍳',
		},
	}
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
				<a href={SPOTIFY_PLAYLIST_LINK + playlist.uri} target="_blank">
					<Card.Content class="pt-6">
						{#if playlist.gif}
							<img src={playlist.gif} alt="Playlist GIF" class="w-full aspect-square object-cover" />
						{:else}
							<img src={`https://i.scdn.co/image/${playlist.imageId}`} alt="No GIF available" class="w-full aspect-square object-cover" />
						{/if}
						<h2 class="py-2 text-xl font-semibold">
							{#if playlist.emoji}
								{playlist.emoji}
							{/if}
							{playlist.title}
						</h2>
						<p class="text-muted-foreground">{capitalize(playlist.season)} - {playlist.year}</p>
					</Card.Content>
				</a>
			</Card.Root>
		{/each}
	</div>

	<div class="mt-12">
		<h2 class="my-4 text-2xl font-semibold">Other Playlists</h2>
		<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
			{#each Object.entries(otherPlaylists) as [key, otherPlaylist]}
				<Card.Root>
					<a href={SPOTIFY_PLAYLIST_LINK + otherPlaylist.uri} target="_blank">
						<Card.Content class="pt-6">
							<h2 class="py-2 text-xl font-semibold">
								{otherPlaylist.title || key}
								{otherPlaylist.emoji}
							</h2>
							<p class="text-muted-foreground">{otherPlaylist.description}</p>
						</Card.Content>
					</a>
				</Card.Root>
			{/each}
		</div>
	</div>
</div>
