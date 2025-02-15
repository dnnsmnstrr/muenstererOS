<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<kbd
  class="relative rounded border bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium text-muted-foreground"
>
  {@render children?.()}
</kbd>