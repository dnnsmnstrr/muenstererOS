<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { i18n } from '$lib/i18n/i18n.svelte';
	let value = $state('draft');
</script>

<div class="w-full max-w-sm space-y-3">
	<Select.Root type="single" bind:value>
		<Select.Trigger aria-label={i18n.t('design.demo.status')}
			>{i18n.t('design.demo.' + value)}</Select.Trigger
		>
		<Select.Content
			><Select.Item value="draft">{i18n.t('design.demo.draft')}</Select.Item><Select.Item
				value="saved">{i18n.t('design.demo.saved')}</Select.Item
			></Select.Content
		>
	</Select.Root>
	<p class="text-sm text-muted-foreground" aria-live="polite">
		{i18n.t('design.demo.status')}: {i18n.t('design.demo.' + value)}
	</p>
</div>
