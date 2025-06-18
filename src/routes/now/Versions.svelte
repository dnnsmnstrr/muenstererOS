<script lang="ts">
    import {
        Root as Dialog,
        Trigger as DialogTrigger,
        Content as DialogContent
    } from '$lib/components/ui/dialog';
    import * as Tooltip from '$lib/components/ui/tooltip';
    import { Button } from '$lib/components/ui/button';

    export let versions: Array<{ url: string, timestamp: string }> = [];
    export let versionPositions: number[] = [];
    export let loadVersion: (url: string) => Promise<void>;

    let showModal = false;
</script>

<Dialog bind:open={showModal}>
    <DialogTrigger>
        <Button variant="secondary">Versions</Button>
    </DialogTrigger>
    <DialogContent class="w-11/12 max-w-2xl p-6">
        <h2 class="mb-4 text-2xl font-bold">Version History</h2>
        <div class="relative h-4 w-full rounded bg-gray-200 dark:bg-gray-700">
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