<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { breakpoints } from '$lib/config';
	import { capitalize } from '$lib/helper';
	import { Info } from 'lucide-svelte';
	import { SPOTIFY_PLAYLIST_LINK, type PlaylistItem } from './+page.svelte';

  export let playlist: PlaylistItem;
  export let compact = false;
  export let setSelectedPlaylistUri = () => {};
</script>

<Card.Root data-playlist-card>
  <div class="group relative">
    <a href={SPOTIFY_PLAYLIST_LINK + playlist.uri} target="_blank">
      <Card.Content class="pt-6">
        {#if !compact}
          {#if playlist.gif}
            <div class="relative">
              <img
                src={playlist.imageUrl || `https://i.scdn.co/image/${playlist.imageId}`}
                alt="Playlist cover"
                class="aspect-square w-full object-cover pb-2 transition-opacity duration-300 rounded"
                class:opacity-0={playlist.isHovered}
              />
              <img
                src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                data-gif-src={playlist.gif}
                data-gif-lazy
                alt="Playlist GIF"
                class="absolute inset-0 aspect-square w-full object-cover pb-2 transition-opacity duration-300 rounded"
                class:opacity-0={!playlist.isHovered}
                on:mouseenter={() =>
                  window.innerWidth >= breakpoints.sm && (playlist.isHovered = true)}
                on:mouseleave={() =>
                  window.innerWidth >= breakpoints.sm && (playlist.isHovered = false)}
              />
            </div>
          {:else}
            <img
              src={playlist.imageUrl || `https://i.scdn.co/image/${playlist.imageId}`}
              alt="No GIF available"
              class="aspect-square w-full object-cover pb-2"
            />
          {/if}
        {/if}
        <div class="flex justify-between items-start">
          <div>
            <h2 class="pb-2 text-xl font-semibold">
              {#if playlist.emoji}
                {playlist.emoji}
              {/if}
              {playlist.title}
            </h2>
            {#if playlist.season}
              <p class="text-muted-foreground">
                {capitalize(playlist.season)} - {playlist.year || 'All Years'}
              </p>
            {/if}
            {#if playlist.description}
              <p class="text-muted-foreground">
                {playlist.description}
              </p>
            {/if}
          </div>
        </div>
      </Card.Content>
    </a>
    <button
      class="absolute top-6 right-6 rounded-full bg-background/50 p-2 backdrop-blur-sm transition-colors hover:bg-background sm:hidden sm:group-hover:block"
      on:click|preventDefault|stopPropagation={() => setSelectedPlaylistUri(playlist.uri)}
    >
      <Info class="h-4 w-4" />
    </button>
  </div>
</Card.Root>