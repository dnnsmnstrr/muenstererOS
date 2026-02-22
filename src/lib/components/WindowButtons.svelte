<script lang="ts">
	import { X, Minus, ChevronsLeftRight } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';

	let {
		onMaximize,
		isMaximized = false
	}: { onMaximize?: () => void; isMaximized?: boolean } = $props();
</script>

<div class="group m-3 inline-flex items-center space-x-2">
	<button
		class="h-3.5 w-3.5 cursor-pointer rounded-full border-0 bg-red-500 p-0 hover:opacity-90"
		aria-label={i18n.t('window.close')}
	>
		<X size={14} color="#000" class="opacity-0 group-hover:opacity-40" />
	</button>
	<button
		class="h-3.5 w-3.5 cursor-pointer rounded-full border-0 bg-yellow-500 p-0 hover:opacity-90"
		aria-label={i18n.t('window.minimize')}
	>
		<Minus size={14} color="#000" class="opacity-0 group-hover:opacity-40" />
	</button>
	<button
		class="h-3.5 w-3.5 cursor-pointer rounded-full border-0 bg-green-500 p-0 hover:opacity-90"
		onclick={() => onMaximize && onMaximize()}
		aria-label={isMaximized ? i18n.t('window.restore') : i18n.t('window.maximize')}
		data-window-action="maximize"
	>
		<ChevronsLeftRight size={14} color="#000" class="rotate-45 opacity-0 group-hover:opacity-40" />
	</button>
</div>
