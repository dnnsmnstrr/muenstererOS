<script lang="ts">
	import {
		Root as Dialog,
		Trigger as DialogTrigger,
		Content as DialogContent
	} from '$lib/components/ui/dialog';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Button } from '$lib/components/ui/button';
	import { GalleryVertical } from 'lucide-svelte';

	export let versions: Array<{ url: string; timestamp: string; change_status: { total: number } }> = [];
	export let versionPositions: number[] = [];
	export let loadVersion: (url: string, timestamp?: string) => Promise<void>;

	let showModal = false;
</script>

<Dialog bind:open={showModal}>
	<DialogTrigger>
		<Button variant="ghost">
			<GalleryVertical class="h-5 w-5" />
			Versions
		</Button>
	</DialogTrigger>
	<DialogContent class="w-11/12 max-w-2xl p-6">
		<div class="mb-4 flex items-center">
			<h2 class="text-2xl font-bold">Version History</h2>
		</div>
		<div class="block sm:hidden max-h-80 overflow-y-auto">
			<ul class="space-y-2">
				{#each versions as version}
					<li class="flex items-center justify-between rounded bg-gray-100 dark:bg-gray-800 px-3 py-2">
						<span>
							{new Date(version.timestamp).toLocaleDateString('en-US', {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit'
							})}
                            {#if version.change_status?.total > 0}
                                <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    ({version?.change_status.total} changes)
                                </span>
                            {/if}
						</span>
						<Button
							variant="outline"
							size="sm"
							onclick={() => {
								loadVersion(version.url, version.timestamp);
								showModal = false;
							}}
						>
							Load
						</Button>
					</li>
				{/each}
			</ul>
		</div>
		<div class="relative h-4 w-full rounded bg-gray-200 dark:bg-gray-700 hidden sm:block">
			{#each versions as version, index}
				<Tooltip.Root>
					<Tooltip.Trigger
						class="absolute h-full w-1 rounded bg-accent"
						style="left: {versionPositions[index]}%"
					>
						<button
							aria-label="Version marker"
							class="absolute left-1/2 h-4 w-1"
							onclick={() => {
								loadVersion(version.url);
								showModal = false;
							}}
						></button>
					</Tooltip.Trigger>
					<Tooltip.Content side="bottom">
						{new Date(version.timestamp).toLocaleDateString('en-US', {
							year: 'numeric',
							month: '2-digit',
							day: '2-digit'
						})}
					</Tooltip.Content>
				</Tooltip.Root>
			{/each}
		</div>
	</DialogContent>
</Dialog>
