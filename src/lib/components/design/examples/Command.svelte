<script lang="ts">
	import * as Command from '$lib/components/ui/command';
	import { i18n } from '$lib/i18n/i18n.svelte';
	let selected = $state('');
</script>

<div class="w-full space-y-3">
	<Command.Root class="rounded-md border" label={i18n.t('design.command')}>
		<Command.Input placeholder={i18n.t('design.search')} aria-label={i18n.t('design.search')} />
		<Command.List
			><Command.Empty>{i18n.t('design.empty')}</Command.Empty><Command.Group
				value="components"
				heading={i18n.t('design.components')}
			>
				{#each ['cards', 'buttons', 'inputs'] as item}<Command.Item
						value={item}
						keywords={[i18n.t('design.examples.' + item + '.title')]}
						onSelect={() => (selected = item)}
						>{i18n.t('design.examples.' + item + '.title')}</Command.Item
					>{/each}
			</Command.Group></Command.List
		>
	</Command.Root>
	<p class="min-h-5 text-sm text-muted-foreground" aria-live="polite">
		{selected ? i18n.t('design.examples.' + selected + '.title') : i18n.t('design.demo.keyboard')}
	</p>
</div>
