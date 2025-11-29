<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
  import {
    File as FileIcon
  } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import type { ComponentType } from "svelte";

  export let name = 'untitled';
  export let href: string | null | undefined;
  export let icon: ComponentType | undefined = undefined;
  
  let Icon = icon || FileIcon;
</script>

<div
  class={cn("text-sm transition-all block pointer-events-none", $$props.class)}
>
  <div
    class="inline-flex flex-col items-center justify-center"
    {...$$restProps}
  >
    <Icon size={40} />
    <span>{name}</span>
  </div>
</div>