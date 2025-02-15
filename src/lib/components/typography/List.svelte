<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	import { cn } from "$lib/utils";

  export let ordered = false
</script>

<svelte:element
  this={ordered ? 'ol' : 'ul'}
  {...$$restProps}
  class={cn("my-6 ml-6 list-disc [&>li]:mt-2", $$props.class, ordered ? 'list-decimal' : 'list-disc')}
>
  <slot />
</svelte:element>