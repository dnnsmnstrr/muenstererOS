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
      {#if charging}
        <BatteryCharging />
      {:else if level < 0.2}
        <BatteryLow />
      {:else if level < 0.6}
        <BatteryMedium />
      {:else}
        <BatteryFull />
      {/if}
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>{Math.round(level * 100)}%</p>
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>