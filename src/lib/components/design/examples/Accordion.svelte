<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion';
	import { i18n } from '$lib/i18n/i18n.svelte';
</script>

<Accordion.Root type="single" class="w-full">
	<Accordion.Item value="one"
		><Accordion.Trigger>{i18n.t('design.demo.details')}</Accordion.Trigger><Accordion.Content
			>{i18n.t('design.demo.description')}</Accordion.Content
		></Accordion.Item
	>
	<Accordion.Item value="two"
		><Accordion.Trigger>{i18n.t('design.demo.accessibility')}</Accordion.Trigger><Accordion.Content
			>{i18n.t('design.demo.keyboard')}</Accordion.Content
		></Accordion.Item
	>
</Accordion.Root>
