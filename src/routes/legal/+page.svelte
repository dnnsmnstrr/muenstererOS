<script lang="ts">
  import { MdSvelte } from '@jazzymcjazz/mdsvelte';
  import legalText from "./impressum.md?raw";
	import { renderers } from "$lib/components/typography";
	import type { TypographyContext } from '$lib/components/typography';
  import * as Card from "$lib/components/ui/card";
	import { setContext } from 'svelte';
	import { page } from '$app/stores';
	import { waitForElementToDisplay } from '$lib/utils/browser';

  setContext<TypographyContext>('typography', {
    renderHeadingAnchors: true,
    externalLinks: true,
  })

  $effect(() => {
    if ($page.url.hash) {
      const anchorId = $page.url.hash
      waitForElementToDisplay(anchorId, (anchor) => {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  });
</script>

<svelte:head>
	<title>Legal Notice</title>
</svelte:head>

<div class="container overflow-y-scroll p-4 card">
  <Card.Root>
    <Card.Content class="pt-6">
      <MdSvelte source={legalText} renderers={renderers} />
    </Card.Content>
  </Card.Root>
</div>
