<script lang="ts">
	import type { HTMLAttributeAnchorTarget } from "svelte/elements";
  import { ExternalLink } from "lucide-svelte";
  import { getContext } from "svelte";
	import type { TypographyContext } from ".";
  const typography = getContext<TypographyContext>('typography')

  interface Props {
    href: string | undefined;
    target?: HTMLAttributeAnchorTarget | null | undefined;
    children?: import('svelte').Snippet;
    [key: string]: any
  }

  let { href, target = $bindable(undefined), children, ...rest }: Props = $props();
  export const text: string = ''
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