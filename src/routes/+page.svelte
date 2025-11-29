<script lang="ts">
	import { WEBSITE_NAME } from '$lib/config';
	import File from '$lib/components/File.svelte';
	import DraggableWindow from '$lib/components/DraggableWindow.svelte';
  import { elementBoundingStore } from '@sveltelegos-blue/svelte-legos';
	import Profile from '$lib/components/Profile.svelte';
	import { onMount } from 'svelte';
	import { desktopFiles, initializeFiles } from '$lib/stores/desktop';
	import Dock from './Dock.svelte';
	import { FileText, Info, FolderOpen } from 'lucide-svelte';

  let element: HTMLElement | null = $state(null);
  let width = $state(0);
  let height = $state(0);
  
  // Define the files to display on desktop
  const files = [
    { id: 'projects', name: 'Projects', href: '/projects', icon: FolderOpen },
    { id: 'experiment', name: 'test.js', href: '/experiment', icon: FileText, leftOffset: 5 },
    { id: 'about', name: 'About', href: '/about', icon: Info, leftOffset: 5 },
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

  $effect(() => {
    // Initialize files if not already positioned or after reset
    if ($desktopFiles.length === 0) {
      initializeFiles(files);
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
      <File name={file.name} href={file.href} icon={file.icon} />
    {/snippet}
  </DraggableWindow>
  <Dock />
</section>