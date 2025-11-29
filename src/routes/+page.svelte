<script lang="ts">
	import { WEBSITE_NAME } from '$lib/config';
	import File from '$lib/components/File.svelte';
	import DraggableWindow from '$lib/components/DraggableWindow.svelte';
  import { elementBoundingStore } from '@sveltelegos-blue/svelte-legos';
	import Profile from '$lib/components/Profile.svelte';
	import { onMount } from 'svelte';
	import { filePosition, initializeFile } from '$lib/stores/desktop';
	import Dock from './Dock.svelte';

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

  onMount(() => {
    if (!$filePosition.x && !$filePosition.y) {
      initializeFile();
    }
  });
</script>

<svelte:head>
	<meta name="description" content={WEBSITE_NAME + ' Desktop'} />
</svelte:head>

<section class="w-full h-full" bind:this={element}>
  <DraggableWindow {width} {height} class="flex justify-center items-center">
    <Profile />
    {#snippet file()}
        <File name='test.txt' href='/playground'  />
      {/snippet}
  </DraggableWindow>
  <Dock />
</section>