<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { i18n } from '$lib/i18n/i18n.svelte';
	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class="rounded-md border px-4 py-2 text-sm hover:bg-accent"
		>{i18n.t('design.demo.open')}</Dialog.Trigger
	>
	<Dialog.Content class="w-[calc(100%-2rem)] rounded-lg">
		<Dialog.Header
			><Dialog.Title>{i18n.t('design.demo.project')}</Dialog.Title><Dialog.Description
				>{i18n.t('design.demo.dialog')}</Dialog.Description
			></Dialog.Header
		>
		<Dialog.Footer
			><Button onclick={() => (open = false)}>{i18n.t('design.demo.done')}</Button></Dialog.Footer
		>
	</Dialog.Content>
</Dialog.Root>
