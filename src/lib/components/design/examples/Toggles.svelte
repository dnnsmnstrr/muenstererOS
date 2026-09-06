<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import { i18n } from '$lib/i18n/i18n.svelte';
	let { id = 'design-toggles' }: { id?: string } = $props();
	let checked = $state(false);
	let enabled = $state(true);
</script>

<div class="space-y-5">
	<div class="flex min-h-11 items-center gap-3">
		<Checkbox id={id + '-check'} bind:checked /><Label for={id + '-check'}
			>{i18n.t('design.demo.check')}</Label
		>
	</div>
	<div class="flex min-h-11 items-center gap-3">
		<Switch id={id + '-switch'} bind:checked={enabled} /><Label for={id + '-switch'}
			>{i18n.t('design.demo.notifications')}</Label
		>
	</div>
	<p class="text-sm text-muted-foreground" aria-live="polite">
		{i18n.t('design.demo.notifications')}: {i18n.t(enabled ? 'design.demo.on' : 'design.demo.off')}
	</p>
</div>
