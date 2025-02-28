<script lang="ts">
	import type { HTMLAttributeAnchorTarget } from "svelte/elements";
  import { ExternalLink } from "lucide-svelte";
  import { getContext } from "svelte";
	import type { TypographyContext } from ".";
  const typography = getContext<TypographyContext>('typography')

  interface Props {
    href?: string;
    target?: HTMLAttributeAnchorTarget | null;
    children?: import('svelte').Snippet;
    [key: string]: any
  }

  let { href, target = $bindable(undefined), node, children, ...rest }: Props = $props();
  if (node && node.url) {
    href = node.url
  }
  if (typography?.externalLinks) {
    target = '_blank'
  }
</script>

<a
  {href}
  {target}
  class="font-medium text-primary underline underline-offset-4 inline-flex items-center gap-1 transition-opacity hover:opacity-80"
  {...rest}
>
  {@render children?.()}
  {#if target === '_blank' && !typography?.externalLinks}
    <ExternalLink size=14 />
  {/if}
</a>