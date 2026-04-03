<script lang="ts">
	import { Heading } from '$lib/components/typography';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { formatDateTime, getFriendlyTime } from '$lib/utils/helper';

	let { data } = $props();

	const statusItems = $derived([
		{
			label: i18n.t('status.monthly_views'),
			value: data.status.monthlyViews.toLocaleString(i18n.lang)
		},
		{
			label: i18n.t('status.cv_status'),
			value: data.status.cvStatus,
			type: 'badge',
			displayValue: i18n.t(`status.${data.status.cvStatus}`)
		},
		{ label: i18n.t('status.page_count'), value: data.status.pageCount.toLocaleString(i18n.lang) },
		{ label: i18n.t('status.commit_count'), value: data.status.commitCount.toLocaleString(i18n.lang) },
		{ 
			label: i18n.t('status.last_deployment'), 
			value: formatDateTime(data.status.lastDeployment), 
			rawValue: data.status.lastDeployment,
			type: 'datetime'
		},
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
							{#if item.type === 'badge'}
								<Badge variant={item.value === 'online' ? 'default' : 'destructive'}>
									{item.displayValue}
								</Badge>
							{:else if item.type === 'datetime'}
								<time datetime={item.rawValue} title={getFriendlyTime(new Date(item.rawValue))}>{item.value}</time>
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
