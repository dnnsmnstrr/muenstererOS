<script lang="ts">
	import { cn } from '$lib/utils';

  interface Props {
    children?: import('svelte').Snippet;
    class?: string;
  }

  let { children, class: className = undefined }: Props = $props();
</script>

<kbd
  class={cn("relative rounded border bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium text-muted-foreground", className)}
>
  {@render children?.()}
</kbd>