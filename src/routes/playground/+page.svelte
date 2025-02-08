<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import Counter from "./Counter.svelte";
	import Heading from "$lib/components/typography/Heading.svelte";
	import List from "$lib/components/typography/List.svelte";
	import Link from "$lib/components/typography/Link.svelte";
	import { counterCount } from "$lib/stores/playground";
  import { Spring } from 'svelte/motion';
	import { onMount } from "svelte";

  const cursor = Spring.of(() => ({ x: 0, y: 0 }), {
		stiffness: 0.05,
		damping: 0.25,
    precision: 0.5
	});

  let cursorContainer = $state({ x: 0, y: 0, width: 0, height: 0 });
  function handleMouseMove(event?: MouseEvent) {
    if (event) {
      cursor.set({ x: event.screenX, y: event.screenY });
    }
  }
  
  function handleResize() {
    if (container) {
      cursorContainer = {
        x: container.offsetLeft,
        y: container.offsetTop,
        width: container.offsetWidth,
        height: container.offsetHeight
      }
    }
  }
  $effect(() => {
    if (container) {
      handleResize();
    }
  })
  onMount(() => {
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  })
  let container: HTMLDivElement | null = null;
  const basis = 'basis-full md:basis-1/2 lg:basis-1/3'

</script>

<Carousel.Root
  class="w-full pt-16"
  opts={{
    align: "start",
    loop: true,
  }}
>
  <Carousel.Content>
    <Carousel.Item class="{basis} h-full">
      <div class="p-2 sm:p-0.5 h-full">
        <Card.Root class="min-h-[500px]">
          <Card.Header>
            <Card.Title>Cursor Tracking</Card.Title>
          </Card.Header>
          <Card.Content class="flex flex-col aspect-square border-2 border-bg rounded-lg m-2">
            <div 
              bind:this={container} 
              class="flex items-center justify-center p-6 relative h-full w-full inset-0" 
            >
                <div 
                class="absolute rounded-full bg-primary w-4 h-4" 
                style="left: {Math.min(Math.max(cursor.current.x - cursorContainer.x, -16), cursorContainer.width)}px; 
                     top: {Math.min(Math.max(cursor.current.y - cursorContainer.y * 5, 8), cursorContainer.height)}px">
                </div>
              x: {Math.round(cursor.current.x)}px <br>
              y: {Math.round(cursor.current.y)}px
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </Carousel.Item>
    <Carousel.Item class={basis}>
      <div class="p-2 sm:p-0.5">
        <Card.Root class="min-h-[500px]">
          <Card.Header>
            <Card.Title>Typography</Card.Title>
            <Card.Description>
              Some custom typography components I created based on
              <Link href="https://www.shadcn-svelte.com/docs/typography" target="_blank">shadcn-svelte</Link>
            </Card.Description>
          </Card.Header>
          <Card.Content
            class="flex flex-col aspect-square items-center justify-center p-6"
          >
            <Heading>Heading</Heading>
            <List class="w-full">
              <li>unordered</li>
              <li>list</li>
            </List>
            <List ordered class="w-full">
              <li>ordered</li>
              <li>list</li>
            </List>

            <Link href="https://www.shadcn-svelte.com/docs/typography" target="_blank">External link</Link>
          </Card.Content>
        </Card.Root>
      </div>
    </Carousel.Item>

    <Carousel.Item class="{basis} h-full">
      <div class="p-2 sm:p-0.5 h-full">
        <Card.Root class="min-h-[500px]">
          <Card.Header>
            <Card.Title>Svelte Counter Component</Card.Title>
          </Card.Header>
          <Card.Content
            class="flex aspect-square items-center justify-center p-6"
          >
            <Counter count={$counterCount} />
          </Card.Content>
        </Card.Root>
      </div>
    </Carousel.Item>
  </Carousel.Content>
  <Carousel.Previous />
  <Carousel.Next />
</Carousel.Root>