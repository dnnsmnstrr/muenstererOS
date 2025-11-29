<script lang="ts">
	import { WEBSITE_NAME } from '$lib/config';
	import File from '$lib/components/File.svelte';
	import DraggableWindow from '$lib/components/DraggableWindow.svelte';
  import { elementBoundingStore } from '@sveltelegos-blue/svelte-legos';
	import Profile from '$lib/components/Profile.svelte';
	import { onMount } from 'svelte';
	import { filePosition, initializeFile, desktopFiles, initializeFiles } from '$lib/stores/desktop';
	import Dock from './Dock.svelte';

  let element: HTMLElement | null = $state(null);
  let width = $state(0);
  let height = $state(0);
  
  // Define the files to display on desktop
  const files = [
    { id: 'test', name: 'test.txt', href: '/playground' },
    { id: 'about', name: 'about.md', href: '/about' },
    { id: 'projects', name: 'projects', href: '/projects' }
  ];
  
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
    // Initialize files if not already positioned
    if ($desktopFiles.length === 0) {
      initializeFiles(files.map(f => f.id));
    }
  });
</script>

<svelte:head>
	<meta name="description" content={WEBSITE_NAME + ' Desktop'} />
</svelte:head>

<section class="w-full h-full" bind:this={element}>
  <DraggableWindow {width} {height} {files} class="flex justify-center items-center">
    <Profile />
    {#snippet file({ file }: { file: typeof files[0] })}
      <File name={file.name} href={file.href} />
    {/snippet}
  </DraggableWindow>
  <Dock />
</section>