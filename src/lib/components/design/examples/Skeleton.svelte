<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button } from '$lib/components/ui/button';
	import { i18n } from '$lib/i18n/i18n.svelte';
	let loading = $state(true);
</script>

<div class="w-full max-w-sm space-y-4">
	<div aria-busy={loading} aria-label={i18n.t('design.demo.project')} class="min-h-20">
		{#if loading}<div class="flex gap-4">
				<Skeleton class="size-12 rounded-full motion-reduce:animate-none" />
				<div class="flex-1 space-y-3">
					<Skeleton class="h-4 w-3/4 motion-reduce:animate-none" /><Skeleton
						class="h-4 w-full motion-reduce:animate-none"
					/>
				</div>
			</div>
		{:else}<p>{i18n.t('design.demo.description')}</p>{/if}
	</div>
	<Button variant="outline" onclick={() => (loading = !loading)}
		>{i18n.t(loading ? 'design.demo.loaded' : 'design.demo.reset')}</Button
	>
</div>
