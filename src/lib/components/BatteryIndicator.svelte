<script lang="ts">
	import { debugLog } from '$lib/stores/app';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { battery } from '@sveltelegos-blue/svelte-legos';
	import BatteryCharging from './icons/battery-charging.svelte';
	import BatteryLow from './icons/battery-low.svelte';
	import BatteryMedium from './icons/battery-medium.svelte';
	import BatteryFull from './icons/battery-full.svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';

	const batteryInfo = battery();
	let { charging, level } = $derived($batteryInfo);
	debugLog('Battery Info:', $batteryInfo);

	const percentage = $derived(Math.round(level * 100));
	const statusText = $derived(
		`${i18n.t('header.battery')}: ${percentage}% (${charging ? i18n.t('header.charging') : i18n.t('header.discharging')})`
	);
</script>

	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<button
					{...props}
					class="flex items-center rounded-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label={statusText}
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
			<p>{statusText}</p>
		</Tooltip.Content>
	</Tooltip.Root>
