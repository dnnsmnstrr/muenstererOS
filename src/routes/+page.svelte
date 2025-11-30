<script lang="ts">
	import { WEBSITE_NAME } from '$lib/config';
	import DraggableWindow from '$lib/components/DraggableWindow.svelte';
  import { elementBoundingStore } from '@sveltelegos-blue/svelte-legos';
	import Profile from '$lib/components/Profile.svelte';
	import NowPlaying from '$lib/components/NowPlaying.svelte';
	import { initializeFiles } from '$lib/stores/desktop';
	import Dock from './Dock.svelte';
	import { onMount } from 'svelte';

  let element: HTMLElement | null = $state(null);
  let width = $state(0);
  let height = $state(0);
  
  
  $effect(() => {
    if (element) {
      const store = elementBoundingStore(element);
      const unsubscribe = store.subscribe((rect) => {
        width = rect.width;
        height = rect.height;
      });
      return unsubscribe;
    }
  });

  // Initialize files once on mount
  onMount(() => {
    initializeFiles();
  });
</script>

<svelte:head>
	<meta name="description" content={WEBSITE_NAME + ' Desktop'} />
</svelte:head>

<section class="w-full h-full" bind:this={element}>
  <DraggableWindow {width} {height} class="flex flex-col gap-4 justify-center items-center p-4">
    <Profile />
  </DraggableWindow>
  <div class="fixed top-52 right-0 -translate-y-1/2 z-20">
    <NowPlaying />
  </div>
  <Dock />
</section>