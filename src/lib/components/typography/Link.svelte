<script lang="ts">
	import type { HTMLAttributeAnchorTarget } from "svelte/elements";
  import { ExternalLink } from "lucide-svelte";
  import { getContext } from "svelte";
	import type { TypographyContext } from ".";
	import { cn } from "$lib/utils";
  const typography = getContext<TypographyContext>('typography')

  interface Props {
    href?: string;
    target?: HTMLAttributeAnchorTarget | null;
    children?: import('svelte').Snippet;
    showIcon?: boolean;
    [key: string]: any
  }

  let { href, target = $bindable(undefined), node, children, showIcon, ...rest }: Props = $props();
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
  {...rest}
  class={cn("font-medium text-primary underline underline-offset-4 inline-flex items-center gap-1 transition-opacity hover:opacity-80", rest.class)}
>
  {@render children?.()}
  {#if (target === '_blank' && !typography?.externalLinks) || showIcon}
    <ExternalLink size=14 />
  {/if}
</a>