<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { i18n } from '$lib/i18n/i18n.svelte';
	const variants = ['default', 'secondary', 'outline', 'ghost', 'link', 'destructive'] as const;
	let count = $state(0);
</script>

<div class="space-y-4">
	<div class="flex flex-wrap gap-2">
		{#each variants as variant}
			<Button {variant} onclick={() => count++}>{variant}</Button>
		{/each}
	</div>
	<div class="flex flex-wrap items-center gap-2">
		<Button size="sm" onclick={() => count++}>{i18n.t('design.demo.small')}</Button>
		<Button size="lg" onclick={() => count++}>{i18n.t('design.demo.large')}</Button>
		<Button disabled>{i18n.t('design.demo.disabled')}</Button>
	</div>
	<p class="text-sm text-muted-foreground" aria-live="polite">
		{i18n.t('design.demo.clicks')}: {count}
	</p>
</div>
