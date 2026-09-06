<script lang="ts">
	import * as Menu from '$lib/components/ui/dropdown-menu';
	import { i18n } from '$lib/i18n/i18n.svelte';
	let saved = $state(false);
</script>

<div class="space-y-3">
	<Menu.Root>
		<Menu.Trigger class="rounded-md border px-4 py-2 text-sm hover:bg-accent"
			>{i18n.t('design.demo.details')}</Menu.Trigger
		>
		<Menu.Content
			><Menu.Item onSelect={() => (saved = true)}>{i18n.t('design.demo.save')}</Menu.Item
			><Menu.Separator /><Menu.Item onSelect={() => (saved = false)}
				>{i18n.t('design.demo.reset')}</Menu.Item
			><Menu.Item disabled>{i18n.t('design.demo.disabled')}</Menu.Item></Menu.Content
		>
	</Menu.Root>
	<p class="text-sm text-muted-foreground" aria-live="polite">
		{i18n.t(saved ? 'design.demo.saved' : 'design.demo.draft')}
	</p>
</div>
