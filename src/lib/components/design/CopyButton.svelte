<script lang="ts">
	import { Copy, Check } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { i18n } from '$lib/i18n/i18n.svelte';
	let { text, label }: { text: string; label?: string } = $props();
	let status = $state<'idle' | 'success' | 'error'>('idle');
	$effect(() => {
		if (status !== 'idle') {
			const timer = setTimeout(() => (status = 'idle'), 2500);
			return () => clearTimeout(timer);
		}
	});
	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			status = 'success';
		} catch {
			status = 'error';
		}
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	<Button variant="outline" size="sm" onclick={copy} aria-label={label ?? i18n.t('design.copy')}>
		{#if status === 'success'}<Check />{:else}<Copy />{/if}
		{status === 'success' ? i18n.t('design.copied') : (label ?? i18n.t('design.copy'))}
	</Button>
	<span role="status" class="text-xs text-muted-foreground"
		>{#if status === 'error'}{i18n.t('design.copy_error')}{:else if status === 'success'}<span
				class="sr-only">{i18n.t('design.copied')}</span
			>{/if}</span
	>
</div>
