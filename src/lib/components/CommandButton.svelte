<script>
	import { isCommandActive } from '$lib/stores/app';
	import { Button } from '$lib/components/ui/button';
	import { Search } from 'lucide-svelte';
	import { isAppleDevice } from '$lib/utils/index';
	import { Kbd } from '$lib/components/ui/kbd';
</script>

<p class="text-sm">
	<Button
		variant="outline"
		onclick={() => ($isCommandActive = !$isCommandActive)}
		class="flex items-center gap-2"
		aria-label="Open command palette"
	>
		<Search />
		<Kbd class="hidden sm:inline-flex bg-muted h-6">
			<span class="text-lg">{isAppleDevice() ? '⌘' : '^'}</span>
      <span class="text-xs pb-0.5"> K </span>
		</Kbd>
	</Button>
</p>
