<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { i18n } from '$lib/i18n/i18n.svelte';
</script>

<Table.Root>
	<Table.Caption>{i18n.t('design.demo.description')}</Table.Caption>
	<Table.Header
		><Table.Row
			><Table.Head>{i18n.t('design.demo.name')}</Table.Head><Table.Head
				>{i18n.t('design.demo.status')}</Table.Head
			></Table.Row
		></Table.Header
	>
	<Table.Body
		>{#each ['Alpha', 'Beta'] as name}<Table.Row
				><Table.Cell>{name}</Table.Cell><Table.Cell
					><Badge variant="outline">{i18n.t('design.demo.draft')}</Badge></Table.Cell
				></Table.Row
			>{/each}</Table.Body
	>
</Table.Root>
