<script lang="ts">
	import { debugLog } from '$lib/stores/app';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { battery } from '@sveltelegos-blue/svelte-legos';
	import BatteryCharging from './icons/battery-charging.svelte';
	import BatteryLow from './icons/battery-low.svelte';
	import BatteryMedium from './icons/battery-medium.svelte';
	import BatteryFull from './icons/battery-full.svelte';
	import { Button } from '$lib/components/ui/button';
	import { i18n } from '$lib/i18n/i18n.svelte';

	const batteryInfo = battery();
	let { charging, level } = $derived($batteryInfo);
	debugLog('Battery Info:', $batteryInfo);

	let percentage = $derived(Math.round(level * 100));
	let ariaLabel = $derived(
		`${i18n.t('header.battery')}: ${percentage}%${charging ? ` (${i18n.t('header.charging')})` : ''}`
	);
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button variant="ghost" size="icon" {...props} aria-label={ariaLabel}>
					{#if charging}
						<BatteryCharging aria-hidden="true" />
					{:else if level < 0.2}
						<BatteryLow aria-hidden="true" />
					{:else if level < 0.6}
						<BatteryMedium aria-hidden="true" />
					{:else}
						<BatteryFull aria-hidden="true" />
					{/if}
				</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{percentage}%</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
