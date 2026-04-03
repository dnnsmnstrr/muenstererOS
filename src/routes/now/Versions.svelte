<script lang="ts">
	import {
		Root as Dialog,
		Trigger as DialogTrigger,
		Content as DialogContent
	} from '$lib/components/ui/dialog';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Button } from '$lib/components/ui/button';
	import { GalleryVertical } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { formatDate } from '$lib/utils/helper';

	export let versions: Array<{ url: string; timestamp: string; change_status: { total: number } }> = [];
	export let versionPositions: number[] = [];
	export let loadVersion: (url: string, timestamp?: string) => Promise<void>;

	let showModal = false;
</script>

<Dialog bind:open={showModal}>
	<DialogTrigger>
		<Button variant="ghost">
			<GalleryVertical class="h-5 w-5" />
			{i18n.t('now.versions')}
		</Button>
	</DialogTrigger>
	<DialogContent class="w-11/12 max-w-2xl p-6">
		<div class="mb-4 flex items-center">
			<h2 class="text-2xl font-bold">{i18n.t('now.version_history')}</h2>
		</div>
		<div class="relative mt-8 h-4 w-full rounded-full bg-gray-200 dark:bg-gray-700">
			<div class="absolute -top-6 left-0 text-xs text-muted-foreground">
				{i18n.t('now.first_version')}
			</div>
			<div class="absolute -top-6 right-0 text-xs text-muted-foreground">
				{i18n.t('now.latest_version')}
			</div>
			{#each versions as version, index}
				<Tooltip.Root>
					<Tooltip.Trigger
						class="absolute top-1/2 -translate-y-1/2 rounded-full bg-primary opacity-80 mix-blend-multiply transition-all hover:scale-125 hover:opacity-100 dark:mix-blend-screen"
						style="left: {versionPositions[index]}%; width: 1.25rem; height: 1.25rem; transform: translate(-50%, -50%);"
					>
						<button
							aria-label={i18n.t('now.version_marker', { date: formatDate(version.timestamp) })}
							class="h-full w-full rounded-full"
							onclick={() => {
								loadVersion(version.url, version.timestamp);
								showModal = false;
							}}
						></button>
					</Tooltip.Trigger>
					<Tooltip.Content side="bottom">
						<div class="flex flex-col items-center">
							<span>{formatDate(version.timestamp)}</span>
							{#if version.change_status?.total > 0}
								<span class="text-xs text-muted-foreground">
									({version.change_status.total === 1
										? i18n.t('now.changes_one')
										: i18n.t('now.changes_many', { count: version.change_status.total.toString() })})
								</span>
							{/if}
						</div>
					</Tooltip.Content>
				</Tooltip.Root>
			{/each}
		</div>
	</DialogContent>
</Dialog>
