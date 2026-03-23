<script lang="ts">
	import { Heading } from '$lib/components/typography';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { formatDateTime } from '$lib/utils/helper';

	let { data } = $props();

	/**
	 * Optimized status items that update automatically when the language changes.
	 * Uses i18n.t for translating labels and badge values.
	 */
	const statusItems = $derived([
		{ label: i18n.t('status.last_deployment'), value: formatDateTime(data.status.lastDeployment) },
		{ label: i18n.t('status.commit_count'), value: data.status.commitCount },
		{ label: i18n.t('status.page_count'), value: data.status.pageCount },
		{
			label: i18n.t('status.cv_status'),
			value: data.status.cvStatus,
			isBadge: true,
			displayValue: i18n.t(`status.${data.status.cvStatus}`)
		}
	]);
</script>

<svelte:head>
	<title>{i18n.t('status.title')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<div class="container mx-auto max-w-2xl p-4">
	<Heading>{i18n.t('status.title')}</Heading>

	<Card.Root>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>{i18n.t('status.metric')}</Table.Head>
					<Table.Head>{i18n.t('status.value')}</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each statusItems as item}
					<Table.Row>
						<Table.Cell class="font-medium">{item.label}</Table.Cell>
						<Table.Cell>
							{#if item.isBadge}
								<Badge variant={item.value === 'online' ? 'default' : 'destructive'}>
									{item.displayValue}
								</Badge>
							{:else}
								{item.value}
							{/if}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Root>
</div>
