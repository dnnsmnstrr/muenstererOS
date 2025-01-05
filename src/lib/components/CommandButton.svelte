<script>
  import { isCommandActive } from '$lib/stores/app';
  import { Button } from "$lib/components/ui/button";
  import {
    Search
  } from "lucide-svelte";
	import { isAppleDevice } from '$lib/browser';
</script>

<p class="text-sm ">
  <Button variant="outline" on:click={() => $isCommandActive = !$isCommandActive} class="flex items-center gap-2">
    <Search />
    <kbd
      class="hidden sm:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
    >
      <span class="text-xs">{isAppleDevice() ? '⌘' : '^'}</span>
      <span class="pb-0.5"> 
        K
      </span>
    </kbd>
  </Button>
</p>