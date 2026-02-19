<script lang="ts">
  import { debugLog } from "$lib/stores/app";
  import * as Tooltip from "$lib/components/ui/tooltip";
	import { battery } from "@sveltelegos-blue/svelte-legos";
	import BatteryCharging from "./icons/battery-charging.svelte";
  import BatteryLow from './icons/battery-low.svelte';
	import BatteryMedium from "./icons/battery-medium.svelte";
	import BatteryFull from "./icons/battery-full.svelte";
  const batteryInfo = battery();
  let {
      charging,
      level
    } = $derived($batteryInfo)
  debugLog('Battery Info:', $batteryInfo)
</script>

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <button
          {...props}
          class="inline-flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Battery: {Math.round(level * 100)}% {charging ? '(Charging)' : ''}"
        >
          {#if charging}
            <BatteryCharging />
          {:else if level < 0.2}
            <BatteryLow />
          {:else if level < 0.6}
            <BatteryMedium />
          {:else}
            <BatteryFull />
          {/if}
        </button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>{Math.round(level * 100)}%</p>
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>