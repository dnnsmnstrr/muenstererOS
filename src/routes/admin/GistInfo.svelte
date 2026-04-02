<script lang="ts">
    import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
    import { Label } from '$lib/components/ui/label';
    import * as Collapsible from '$lib/components/ui/collapsible';
    import { ChevronDown } from 'lucide-svelte';
    import { Button } from '$lib/components/ui/button';
	import type { GistData } from '$lib/utils/github-api';
	import { i18n } from '$lib/i18n/i18n.svelte';


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
                    {i18n.t('admin.gist_info')}
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
                        <Label class="text-xs uppercase text-muted-foreground">{i18n.t('admin.description')}</Label>
                        <p>{gistInfo?.description ?? i18n.t('admin.no_description')}</p>
                    </div>

                    <div>
                        <Label class="text-xs uppercase text-muted-foreground">{i18n.t('admin.last_updated')}</Label>
                        <!-- Optimization: Use locale-aware formatting for date and time -->
                        <p>{lastUpdated ? lastUpdated.toLocaleString(i18n.lang) : i18n.t('common.na')}</p>
                    </div>

                    <div>
                        <Label class="text-xs uppercase text-muted-foreground">{i18n.t('admin.public')}</Label>
                        <p>{gistInfo?.public ? i18n.t('common.yes') : i18n.t('common.no')}</p>
                    </div>

                    <div>
                        <Label class="text-xs uppercase text-muted-foreground">{i18n.t('admin.versions')}</Label>
                        <p>{history?.length > 0 ? history.length : i18n.t('common.na')}</p>
                    </div>
                </div>

                <div class="mt-4">
                    <a
                        href={gistInfo?.html_url}
                        target="_blank"
                        class="text-sm text-blue-600 hover:underline"
                        rel="noopener noreferrer"
                    >
                        {i18n.t('admin.view_on_github')} ↗
                    </a>
                </div>
            </CardContent>
        </Collapsible.Content>
    </Collapsible.Root>
</Card>
