<script lang="ts">
    import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
    import { Label } from '$lib/components/ui/label';
    import * as Collapsible from '$lib/components/ui/collapsible';
    import { ChevronDown } from 'lucide-svelte';
    import { Button } from '$lib/components/ui/button';
	import type { GistData } from '$lib/utils/github-api';


    let {
		gistInfo = $bindable<GistData>(),
		history = [],
		isOpen = $bindable(false)
	} = $props();

    let lastUpdated = gistInfo?.updated_at ? new Date(gistInfo.updated_at) : null;
</script>

<Card>
    <Collapsible.Root bind:open={isOpen}>
        <CardHeader class="p-0">
            <Collapsible.Trigger class="p-0">
                <Button
                    variant="ghost"
                    class="w-full justify-between p-6 font-semibold hover:bg-transparent"
                >
                    Gist Information
                    <ChevronDown
                        class="h-4 w-4 transition-transform duration-200{isOpen ? ' rotate-180' : ''}"
                    />
                </Button>
            </Collapsible.Trigger>
        </CardHeader>

        <Collapsible.Content>
            <CardContent>
                <div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <Label class="text-xs uppercase text-muted-foreground">Description</Label>
                        <p>{gistInfo?.description ?? 'No description'}</p>
                    </div>

                    <div>
                        <Label class="text-xs uppercase text-muted-foreground">Last Updated</Label>
                        <p>{lastUpdated ? lastUpdated.toLocaleString() : 'N/A'}</p>
                    </div>

                    <div>
                        <Label class="text-xs uppercase text-muted-foreground">Public</Label>
                        <p>{gistInfo?.public ? 'Yes' : 'No'}</p>
                    </div>

                    <div>
                        <Label class="text-xs uppercase text-muted-foreground">Versions</Label>
                        <p>{history?.length > 0 ? history.length : 'N/A'}</p>
                    </div>
                </div>

                <div class="mt-4">
                    <a
                        href={gistInfo?.html_url}
                        target="_blank"
                        class="text-sm text-blue-600 hover:underline"
                        rel="noopener noreferrer"
                    >
                        View on GitHub ↗
                    </a>
                </div>
            </CardContent>
        </Collapsible.Content>
    </Collapsible.Root>
</Card>
