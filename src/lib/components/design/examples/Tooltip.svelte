<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { i18n } from '$lib/i18n/i18n.svelte';
</script>

<Tooltip.Provider delayDuration={200}>
	<Tooltip.Root>
		<Tooltip.Trigger class="rounded-md border px-4 py-2 text-sm hover:bg-accent"
			>{i18n.t('design.demo.accessibility')}</Tooltip.Trigger
		>
		<Tooltip.Content role="tooltip" class="max-w-xs"
			>{i18n.t('design.demo.keyboard')}</Tooltip.Content
		>
	</Tooltip.Root>
</Tooltip.Provider>
