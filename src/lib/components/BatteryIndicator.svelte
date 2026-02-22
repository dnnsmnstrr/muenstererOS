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
					class="inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
					aria-label="Battery level: {Math.round(level * 100)}%{charging ? ', charging' : ''}"
				>
					{#if charging}
						<BatteryCharging aria-hidden="true" />
					{:else if level < 0.2}
						<BatteryLow aria-hidden="true" />
					{:else if level < 0.6}
						<BatteryMedium aria-hidden="true" />
					{:else}
						<BatteryFull aria-hidden="true" />
					{/if}
				</button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{Math.round(level * 100)}% {charging ? '(charging)' : ''}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>