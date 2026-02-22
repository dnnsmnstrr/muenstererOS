<script>
	import { isCommandActive } from '$lib/stores/app';
	import { Button } from '$lib/components/ui/button';
	import { Search } from 'lucide-svelte';
	import { isAppleDevice } from '$lib/utils/index';
	import { Kbd } from '$lib/components/ui/kbd';
	import { i18n } from '$lib/i18n/i18n.svelte';
</script>

<p class="text-sm">
	<Button
		variant="outline"
		onclick={() => ($isCommandActive = !$isCommandActive)}
		class="flex items-center gap-2"
		aria-label={i18n.t('header.command_palette')}
	>
		<Search />
		<Kbd class="hidden h-6 bg-muted sm:inline-flex">
			<span class="text-lg">{isAppleDevice() ? '⌘' : '^'}</span>
			<span class="pb-0.5 text-xs"> K </span>
		</Kbd>
	</Button>
</p>
