<script lang="ts">
  import { run } from 'svelte/legacy';

	import { WEBSITE_NAME } from '$lib/config';
	import File from '$lib/components/File.svelte';
	import DraggableWindow from '$lib/components/DraggableWindow.svelte';
  import { elementBoundingStore } from 'svelte-legos';
	import Profile from '$lib/components/Profile.svelte';
	import { onMount } from 'svelte';
	import { filePosition, initializeFile } from '$lib/stores/desktop';
	import Dock from './Dock.svelte';

  let element: HTMLElement | null = $state(null);
  let rect = $state(null);
  run(() => {
    element && (rect = elementBoundingStore(element));
  });
  let { width, height } = $derived($rect || { width: 0, height: 0 });

  onMount(() => {
    if (!$filePosition.x && !$filePosition.y) {
      initializeFile()
    }
  })
</script>

<svelte:head>
	<title>Home</title>
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