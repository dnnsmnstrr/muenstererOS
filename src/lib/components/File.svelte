<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
  import {
    File
  } from "lucide-svelte";
  import { cn } from "$lib/utils";

  export let name = 'untitled';
  export let href: string | null | undefined;
</script>

<div
  class={cn("text-sm transition-all block", $$props.class)}
>
  <a
    {href}
    class="inline-flex flex-col items-center justify-center"
    {...$$restProps}
  >
    <File size=40 />
    <span>{name}</span>
  </a>
</div>