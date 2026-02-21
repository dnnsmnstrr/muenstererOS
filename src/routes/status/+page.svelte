<script lang="ts">
	import { Heading } from '$lib/components/typography';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();
	const { status } = data;

	const statusItems = [
		{ label: 'Last Deployment', value: new Date(status.lastDeployment).toLocaleString() },
		{ label: 'Commit Count', value: status.commitCount },
		{ label: 'Page Count', value: status.pageCount },
		{ label: 'CV Page Status', value: status.cvStatus, isBadge: true }
	];
</script>

<div class="container mx-auto max-w-2xl p-4">
	<Heading>System Status</Heading>

	<Card.Root>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Metric</Table.Head>
					<Table.Head>Value</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each statusItems as item}
					<Table.Row>
						<Table.Cell class="font-medium">{item.label}</Table.Cell>
						<Table.Cell>
							{#if item.isBadge}
								<Badge variant={item.value === 'online' ? 'default' : 'destructive'}>
									{item.value}
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
