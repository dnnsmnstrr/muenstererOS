<script lang="ts">
	import Link from '$lib/components/typography/Link.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import { links } from '$lib/config';
	import { capitalize } from '$lib/helper';
	interface PlaylistItem {
		title: string;
		type: 'season' | 'aggregated' | 'theme'
		season?: 'winter' | 'spring' | 'summer' | 'autumn';
		year?: number;
		uri: string;
		emoji?: string;
		description?: string;
		tags?: string[];
		gif?: string;
		imageId?: string;
		imageUrl?: string;
	}

	const SPOTIFY_PLAYLIST_LINK = 'https://open.spotify.com/playlist/';

	let showGifs = false
	
	const allPlaylists: PlaylistItem[] = [
		// Season Playlists with most recent on top
		{
			title: 'Warten',
			type: 'season',
			season: 'winter',
			year: 2024,
			uri: '5k4CrIEvYeNCg0go3BPR56',
			imageId: 'ab67706c0000da84a3ef353d2a4a4acd33a14e90',
			gif: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNG51MWo2c2d4aW04M2Rwa2w4MnI1NjU2NnN3Y2twZm51OXYzazFqNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/K3G6ZEHsbHKGnogFaP/giphy.gif'
		},
		{
			title: 'Wien / München / Köln / Leipzig',
			type: 'season',
			season: 'autumn',
			year: 2024,
			emoji: '🚇',
			uri: '2BamYUcYazuRqudq38MX8Q',
			imageUrl: '	https://mosaic.scdn.co/300/ab67616d00001e0245714d4faea1b489f512fb66ab67616d00001e02784358129cd460359e4d3bc1ab67616d00001e02a1a8cc7a3e331018c0ba4b1aab67616d00001e02d26fe3ed061351528939dcd7',
			gif: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2M3emdlZHA2MTl1cnl3MWE3azJ6NHRna2RpZ3Fza2gzaTI2bGZycyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4P6JgvKB3KFWM/giphy.gif'
		},
		{
			title: 'Pools & Palm Trees',
			type: 'season',
			season: 'summer',
			year: 2024,
			emoji: '🌴',
			uri: '7fKN8cSY9vaqQU3yEErWHk',
			imageId: 'ab67706c0000da84a1a4e996a0907d62149b28f5',
			gif: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjF3YXYxejYwOGk2ajdic2htbDV4b3RyMHVrbWM4eHBuejNvcHk1NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9xvjobE8fQedmw9f3i/giphy.gif'
		},
		{
			title: 'Still Blue',
			type: 'season',
			year: 2024,
			emoji: '🔵',
			season: 'spring',
			uri: '0RtPwbbEC1Okw9Zi2M5FBs',
			imageUrl: 'https://mosaic.scdn.co/300/ab67616d00001e02535634bd95d200ed6e383c5dab67616d00001e02712d202b47d042cce6fc3d09ab67616d00001e02d4085ac8f9a5006b78091abcab67616d00001e02eedc467ec0cec52f22940a32',
			gif: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHkzczQ4cDNvMnJrcWpxZnBiM2QzdmVicmN2eTlrb2NobWRqOGI0cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1Az20wU0ArVMk/giphy.gif'
		},
		{
			title: 'Monsters',
			type: 'season',
			season: 'winter',
			year: 2023,
			emoji: '👹',
			uri: '3tes9ptMPMRmiR4HFcqk4J',
			imageId: 'ab67706c0000da84d5f914c118f5bfaacaf7e81a'
		},
		{
			title: 'Regen',
			type: 'season',
			season: 'autumn',
			year: 2023,
			emoji: '🌧️',
			uri: '2BamYUcYazuRqudq38MX8Q',
			imageId: 'ab67706c0000da8482bdfe8492e17ebe3277359f',
			gif: 'https://media4.giphy.com/media/G3lxvBMhGu53y/giphy.webp'
		},
		{
			title: 'summer pt. ii',
			type: 'season',
			season: 'summer',
			year: 2023,
			uri: '6vv0k98f8LOdER20fGDk6T',
			imageId: 'ab67706c0000da84190c48db823c4f0bdfe11b60'
		},
		{
			title: 'Take it off',
			type: 'season',
			season: 'summer',
			year: 2023,
			emoji: '🧑‍🚀',
			uri: '1w9orNgLp1zrOXxt5dAURP',
			imageId: 'ab67706c0000da84ee11e38c63e5e4562e8cdf79'
		},
		{
			title: 'Let it Breathe',
			type: 'season',
			season: 'spring',
			year: 2023,
			emoji: '😷',
			uri: '3T8e2O5sYOVqSERJnmTqvL',
			imageId: 'ab67706c0000da8496c18a547c776710a0574226'
		},
		{
			title: 'Temporär Winter',
			type: 'season',
			season: 'winter',
			year: 2022,
			emoji: '⏱',
			uri: '3YKHRGx3OoWO2tRe3Duorm',
			imageId: 'ab67706c0000da84293cd683441ea1eea0a75181'
		},
		{
			title: 'Wheelspin',
			type: 'season',
			season: 'autumn',
			year: 2022,
			emoji: '🛞',
			uri: '3tjs4iA2kxUTg0eRvI7CXu',
			imageId: 'ab67706c0000da8403eec05b46073bf5ecdd5f45'
		},
		{
			title: 'Haus am See',
			type: 'season',
			season: 'summer',
			year: 2022,
			emoji: '🏊',
			uri: '4NKKIGbSYz87c5kGSAzcKj',
			imageUrl: 'https://mosaic.scdn.co/300/ab67616d00001e021c0b1d95400d20030901cfe2ab67616d00001e028b7b5271186292e2cd13c456ab67616d00001e02905615e09cfbd090ae342337ab67616d00001e02e30db4eeb184b8e04d78140c'
		},
		{
			title: 'Wann strahlst du?',
			type: 'season',
			season: 'spring',
			year: 2022,
			emoji: '🌅',
			uri: '6e8W0uUCobxVSU5BiWFTBA',
			imageUrl: 'https://mosaic.scdn.co/300/ab67616d00001e02256ef0f5036e304e5bd29da0ab67616d00001e0247c3c96f265f33dafa5b733bab67616d00001e029b5f1ef435fd5565dc561b17ab67616d00001e02dadf36e0f82bdc1e1f59fe66'
		},
		{
			title: 'Schneemann',
			type: 'season',
			season: 'winter',
			year: 2021,
			emoji: '⛄',
			uri: '5WA3l00TkcKOx7s2J9CvoK',
			imageUrl: 'https://mosaic.scdn.co/300/ab67616d00001e021e7790e5b09c42c3f5948719ab67616d00001e022c414d292370ca0e27cb9133ab67616d00001e023a1bdb8d2b9dd573fa3d27f8ab67616d00001e024fcdd3305b9d121585fd46d2'
		},
		{
			title: 'Another Click In The Firewall, Pt. 1 - 2021 Remastered Version',
			type: 'season',
			season: 'autumn',
			year: 2021,
			emoji: '🧱',
			uri: '6TYM6OrQUrYOdUqqB1mSdq',
			imageId: 'ab67706c0000da84ba36b26b76443887ec9bc8cf'
		},
		{
			title: 'Haus am See',
			type: 'season',
			season: 'summer',
			year: 2021,
			emoji: '🏘️',
			uri: '0id9REyrwK1SVDjFzHQg1d',
			imageId: 'ab67706c0000da841e12e004f410fd5ea340ad94'
		},
		{
			title: 'Dandelion',
			type: 'season',
			season: 'spring',
			year: 2021,
			emoji: '🌼',
			uri: '3ppo3GRmO9Qe0NUCkjBMlk',
			imageUrl: 'https://mosaic.scdn.co/300/ab67616d00001e02063f384fe7c80bb1acafaf5dab67616d00001e02762d8a7a159d07187d8b2121ab67616d00001e02cc964e9b51ec54ed99379178ab67616d00001e02cca7a030886ad60309a7ea25'
		},
		{
			title: '',
			type: 'season',
			season: 'winter',
			year: 2020,
			emoji: '⬜',
			uri: '6ntnHjoU5nToi2PWreboAS',
			imageId: 'ab67706c0000da84fa0f37669e75c0adebafe8f5'
		},
		{
			title: 'Woods',
			type: 'season',
			season: 'autumn',
			year: 2020,
			emoji: '🌲',
			uri: '6eVrGIe9pLWlgHGYV69BhH',
			imageUrl: 'https://mosaic.scdn.co/300/ab67616d00001e0235018788537f9ea1eb8785dcab67616d00001e0240af1e135acae3fa926214e2ab67616d00001e026f9273c9e2491b5282034ed5ab67616d00001e02d9194aa18fa4c9362b47464f'
		},
		{
			title: 'Flamingo',
			type: 'season',
			season: 'summer',
			year: 2020,
			emoji: '🦩',
			uri: '4WsbLNwhiiChiIdonkMY0H',
			imageUrl: 'https://mosaic.scdn.co/300/ab67616d00001e0201ed93619be25bfbb7f7d6efab67616d00001e026d79c6a1b7e13ec8dcbce1a1ab67616d00001e029a47344c4ee6d15fd04a80f1ab67616d00001e02c5edbbbd82c91bc43c67688d'
		},
		{
			title: 'Springtime',
			type: 'season',
			season: 'spring',
			year: 2020,
			emoji: '🐦',
			uri: '29XQuVB5OImZi8SM5kjGnj',
			imageUrl: 'https://mosaic.scdn.co/300/ab67616d00001e02697fa80f305cc7ed8139fcb5ab67616d00001e029709ddd3d238254048199ae0ab67616d00001e02cc2504583eeb105a99b54cc8ab67616d00001e02fb0a0070021c43528bbcce6d'
		},
		{
            title: 'Dear Winter',
            type: 'season',
            season: 'winter',
            year: 2019,
            emoji: '🌨️',
            uri: '3BusobJEAVCmrxoCnRk04p',
            imageUrl: 'https://i.scdn.co/image/ab67706c0000da84406ebf2ec3c7645a241f0340'
        },
		{
            title: 'Kein Bock',
            type: 'season',
            season: 'autumn',
            year: 2019,
            emoji: '🖕',
            uri: '6aHiIClhGX8WLTo1H8SolP',
            imageUrl: 'https://i.scdn.co/image/ab67706c0000da84d043060eaa14dd54acc9c7e5'
        },
		{
            title: '38317',
            type: 'season',
            season: 'summer',
            year: 2019,
            emoji: '❤️',
            uri: '4pSWJr2g1WIz38BQqhw2qa',
            imageUrl: 'https://i.scdn.co/image/ab67706c0000da842bf0ff0d4f6e274034c3a3ce'
        },
		{
            title: 'Peach Fuzz',
            type: 'season',
            season: 'spring',
            year: 2019,
            emoji: '🍑',
            uri: '1sd3QxFmsm5klpNUWo4bj8',
            imageUrl: 'https://i.scdn.co/image/ab67706c0000da843467705ce3a35c97ab263935'
        },
		{
            title: 'Snow White',
            type: 'season',
            season: 'winter',
            year: 2018,
            emoji: '❄︎',
            uri: '5DUdK2ydPgYEsithmi0PWQ',
            imageUrl: 'https://i.scdn.co/image/ab67706c0000da84c3e1c29023c07fd90a34913b'
        },
		{
            title: 'hard rain.',
            type: 'season',
            season: 'autumn',
            year: 2024,
            emoji: '',
            uri: '2Sd0pHb7Z6IrD7eNPLPSrp',
            imageUrl: 'https://i.scdn.co/image/ab67706c0000da8452de2f366915d239cd104427'
        },
		{
            title: 'Waves & Sun',
            type: 'season',
            season: 'summer',
            year: 2018,
            emoji: '🌊☀️',
            uri: '1ddFBysF1pBiUQnU7lhQie',
            imageUrl: 'https://i.scdn.co/image/ab67706c0000da84064cc0f310a582a2e9e7917f'
        },
		{
            title: 'Honey Lavender',
            type: 'season',
            season: 'spring',
            year: 2018,
            emoji: '🪻',
            uri: '0NItn3gQG1xvcEJBVsvyYa',
            imageUrl: 'https://i.scdn.co/image/ab67706c0000da84ddebaaa5ba27ee72bacb3d05'
        },
		{
            title: 'Deutsch in Kaltland',
            type: 'season',
            season: 'winter',
            year: 2017,
            emoji: '🥶',
            uri: '1848N9RTlN3StgrX9eLARj',
            imageUrl: 'https://i.scdn.co/image/ab67706c0000da84228fa213943c94bb37e1aefd'
        },
		{
            title: 'the_leaves_are_brown',
            type: 'season',
            season: 'autumn',
            year: 2017,
            emoji: '🍂',
            uri: '0ZixkDiC6lyORcnGdZSpgq',
            imageUrl: 'https://i.scdn.co/image/ab67706c0000da84a2b82428bf0049a00b0b1724'
        },
		{
            title: 'i might...',
            type: 'season',
            season: 'summer',
            year: 2017,
            emoji: '💸',
            uri: '0KYlHTlDl0LrolDolsZg2e',
            imageUrl: 'https://i.scdn.co/image/ab67706c0000da84a8cd500430be26bf76bed6f3'
        },

		// Aggregated Season Playlists
		{
			uri: '68z163CKUImi0QB6ZpSigr',
			title: 'Spring',
			season: 'spring',
			description: 'All songs from my spring playlists',
			emoji: '🌼',
			type: 'aggregated'
		},
		{
			uri: '5wpb3PdQOzFb3jurTcVfZO',
			title: 'Summer',
			season: 'summer',
			description: 'All songs from my summer playlists',
			emoji: '☀️',
			type: 'aggregated'
		},
		{
			uri: '22XncHS02W5RWJ1yM4lV6l',
			title: 'Autumn',
			season: 'autumn',
			description: 'All songs from my autumn playlists',
			emoji: '🍂',
			type: 'aggregated'
		},
		{
			uri: '67SvJfEofXhdIXwsuUJbCJ',
			title: 'Winter',
			season: 'winter',
			description: 'All songs from my winter playlists',
			emoji: '❄️',
			type: 'aggregated'
		},
		{
			uri: '13RQxSzWqVg3fHlalxlyhC',
			title: 'Milk of the Poppy',
			description: 'Songs to fall asleep to',
			emoji: '🛌',
			type: 'theme',
		},
		{
			uri: '0camicGxGNwB9YS66nAwtb',
			title: '1337 h4xX0r',
			emoji: '🖥  ⌨️🖱',
			description: 'Songs to code to',
			type: 'theme',
		},
		{
			uri: '4X1uZRUIccnwcofS8QjBku',
			title: 'Rennen',
			description: 'Songs to run to',
			emoji: '🏃‍➡️',
			type: 'theme',
		},
		{
			uri: '4HvN65IMe9oEWqMl1zHCIE',
			title: 'Memeology',
			description: 'Songs that became a meme',
			emoji: '🐸',
			type: 'theme',
		},
		{
			uri: '1E5n3EWqT9MDPUb1qvGjsb',
			title: 'Partytime',
			description: 'Songs to party to',
			emoji: '🎉',
			type: 'theme',
		},
		{
			uri: '2OHb3F8gQqQY4hb14p2uoe',
			title: 'Latenite',
			description: 'Songs to get through a long night',
			emoji: '🌃',
			type: 'theme',
		},
		{
			uri: '6FhnyDVlq5Az6Bllb7einR',
			title: 'the morning after',
			description: 'Songs to cure your hangover',
			emoji: '🌅',
			type: 'theme',
		},
		{
			uri: '5w86GPXC86kKEpbLSKVxFS',
			title: 'Piano',
			description: 'Songs I can play on the piano',
			emoji: '🎹',
			type: 'theme',
		},
		{
			uri: '5idv5XxAwr7q9u4hyWNaNH',
			title: 'Blitzblank',
			description: 'Songs to clean your house to',
			emoji: '🧹',
			type: 'theme',
		},
		{
			uri: '66wQsRoITiTV5xeG6T19wH',
			title: 'Cooking Inspo',
			description: 'Songs to get your taste buds ready',
			emoji: '🧑‍🍳',
			type: 'theme',
		}
	];

	const currentPlaylist = allPlaylists[0];
	const seasonPlaylists = allPlaylists.filter(playlist => playlist.type === 'season')
	const aggregatedPlaylists = allPlaylists.filter(playlist => playlist.type === 'aggregated')
	const otherPlaylists = allPlaylists.filter(playlist => playlist.type === 'theme')

	let filterQuery = '';
	const searchFilter = (playlist: PlaylistItem) => {
		if (!filterQuery) {
			return true;
		}
		const query = filterQuery.toLowerCase();
		return (
			playlist.title.toLowerCase().includes(query) ||
			playlist.description?.toLowerCase().includes(query) ||
			playlist.season?.toLowerCase().includes(query) ||
			playlist.year?.toString().includes(query)
		);
	};

	$: filteredPlaylists = filterQuery ? allPlaylists.filter(searchFilter) : seasonPlaylists;
</script>

<svelte:head>
	<title>Playlists</title>
</svelte:head>

<div class="container overflow-y-scroll p-4">
	<div class="mb-6 flex items-start justify-between gap-2">
		<h1 class="text-3xl font-bold">My Playlists</h1>
		<div class="flex items-center">
			<Switch bind:checked={showGifs} class="mr-2"/> <span class="opacity-70">Show GIFs</span>
			<Input placeholder="Search playlists..." type="search" class="w-52 ml-4" bind:value={filterQuery} />
		</div>
	</div>

	{#if filterQuery && !filteredPlaylists.length}
		<div class="text-center opacity-50">
			No matching playlists found.
			<br><br>
			Check out <Link href={links.spotify + '/playlists'}>my Spotify profile</Link> for more playlists.
		</div>
	{/if}

	{#if !filterQuery}
		<iframe
			title="Current Playlist"
			style="border-radius:12px"
			src="https://open.spotify.com/embed/playlist/{currentPlaylist.uri}"
			width="100%"
			height="352"
			frameBorder="0"
			allowfullscreen=""
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			loading="lazy"
		></iframe>
	{/if}

	{#if filteredPlaylists.length}
		<div class="grid grid-cols-1 gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredPlaylists as playlist}
				<Card.Root>
					<a href={SPOTIFY_PLAYLIST_LINK + playlist.uri} target="_blank">
						<Card.Content class="pt-6">
							{#if !filterQuery}
								{#if playlist.gif && showGifs}
									<img
										src={playlist.gif}
										alt="Playlist GIF"
										class="aspect-square w-full object-cover pb-2"
									/>
								{:else}
									<img
										src={playlist.imageUrl || `https://i.scdn.co/image/${playlist.imageId}`}
										alt="No GIF available"
										class="aspect-square w-full object-cover pb-2"
									/>
								{/if}
							{/if}
							<h2 class="pb-2 text-xl font-semibold">
								{#if playlist.emoji}
									{playlist.emoji}
								{/if}
								{playlist.title}
							</h2>
							{#if playlist.season}
								<p class="text-muted-foreground">{capitalize(playlist.season)} - {playlist.year || 'All Years'}</p>
							{/if}
						</Card.Content>
					</a>
				</Card.Root>
			{/each}
		</div>
	{/if}

	{#if !filterQuery}
		<div class="mt-12">
			{#if aggregatedPlaylists.length}
				<h2 class="my-4 text-2xl font-semibold">Season Playlists</h2>
			{/if}
			<div class="grid grid-cols-4 gap-6">
				{#each aggregatedPlaylists as seasonPlaylist}
					<Card.Root title={seasonPlaylist.title}>
						<a href={SPOTIFY_PLAYLIST_LINK + seasonPlaylist.uri} target="_blank">
							<Card.Content class="flex items-center justify-center gap-4 p-4">
								{seasonPlaylist.emoji}
								<h2 class="py-2 text-xl font-semibold hidden md:block">
									{seasonPlaylist.title}
								</h2>
							</Card.Content>
						</a>
					</Card.Root>
				{/each}
			</div>
		</div>
		<div class="mt-12">
			{#if otherPlaylists.length}
				<h2 class="my-4 text-2xl font-semibold">Other Playlists</h2>
			{/if}
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
				{#each otherPlaylists as otherPlaylist}
					<Card.Root>
						<a href={SPOTIFY_PLAYLIST_LINK + otherPlaylist.uri} target="_blank">
							<Card.Content class="pt-6">
								<h2 class="py-2 text-xl font-semibold">
									{otherPlaylist.title}
									{otherPlaylist.emoji}
								</h2>
								<p class="text-muted-foreground">{otherPlaylist.description}</p>
							</Card.Content>
						</a>
					</Card.Root>
				{/each}
			</div>
		</div>
	{/if}
</div>
