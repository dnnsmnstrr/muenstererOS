<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { i18n } from '$lib/i18n/i18n.svelte';
	let { id = 'design-inputs' }: { id?: string } = $props();
	let name = $state('');
	let note = $state('');
</script>

<div class="w-full max-w-sm space-y-3">
	<Label for={id + '-name'}>{i18n.t('design.demo.name')}</Label>
	<Input id={id + '-name'} bind:value={name} placeholder={i18n.t('design.demo.name')} />
	<Label for={id + '-note'}>{i18n.t('design.demo.note')}</Label>
	<Textarea id={id + '-note'} bind:value={note} placeholder={i18n.t('design.demo.write')} />
	<Input
		aria-label={i18n.t('design.demo.disabled')}
		disabled
		placeholder={i18n.t('design.demo.disabled')}
	/>
</div>
