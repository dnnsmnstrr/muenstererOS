<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import { i18n } from '$lib/i18n/i18n.svelte';
</script>

<Tabs.Root value="preview" class="w-full">
	<Tabs.List aria-label={i18n.t('design.examples.tabs.title')}>
		<Tabs.Trigger value="preview">{i18n.t('design.preview')}</Tabs.Trigger>
		<Tabs.Trigger value="details">{i18n.t('design.demo.details')}</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="preview" class="p-4">{i18n.t('design.demo.description')}</Tabs.Content>
	<Tabs.Content value="details" class="p-4">{i18n.t('design.demo.keyboard')}</Tabs.Content>
</Tabs.Root>
