<script lang="ts">
	import { Hash } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { Button } from "$lib/components/ui/button"
  import slugify from "slugify";
	import { page } from "$app/stores";
	import { getContext } from "svelte";
	import type { TypographyContext } from ".";
  const typography = getContext<TypographyContext>('typography')

  interface Props {
    class?: string | undefined;
    depth?: number;
    children?: import('svelte').Snippet;
  }

  let { class: className = undefined, depth = 1, children }: Props = $props();
  const levels = [
    'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6',
    'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 mt-4 mb-2',
    'scroll-m-20 text-2xl font-semibold tracking-tight mt-3 mb-2',
    'scroll-m-20 text-xl font-semibold tracking-tight my-2'
  ]

  let data: HTMLHeadingElement = $state();
  let id = $derived(slugify(data?.innerText || data?.innerHTML.toString() || '', {remove: /[\/*+~.()'"!:@]/g}))
  let isLinked = $derived($page.url.hash === '#' + id)
  
</script>


<svelte:element this={"h" + depth} class={cn(levels[depth - 1], "group", className)} bind:this={data} {id} >
  {@render children?.()}
  {#if typography?.renderHeadingAnchors}
    <Button
      variant={isLinked ? "outline" : "link"}
      size="icon"
      href={'#' + id}
      class="opacity-{isLinked ? 20 : 0} group-hover:opacity-50 transition-opacity"
    >
      <Hash />
    </Button>
  {/if}
</svelte:element>