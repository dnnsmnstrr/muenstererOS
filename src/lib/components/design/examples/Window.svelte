<script lang="ts">
	import { Window } from '$lib/components/ui/window';
	import { Button } from '$lib/components/ui/button';
	import { i18n } from '$lib/i18n/i18n.svelte';
	let closed = $state(false);
	let minimized = $state(false);
	let maximized = $state(false);
</script>

<div class="w-full">
	{#if closed}
		<Button variant="outline" onclick={() => (closed = false)}
			>{i18n.t('design.demo.restore')}</Button
		>
	{:else}
		<Window
			class={maximized ? 'w-full' : 'max-w-sm'}
			childClassName={minimized ? 'hidden' : ''}
			onClose={() => (closed = true)}
			onMinimize={() => (minimized = !minimized)}
			onMaximize={() => (maximized = !maximized)}
			isMaximized={maximized}
		>
			{#snippet titlebarCenter()}<span class="text-xs">{i18n.t('design.demo.project')}</span
				>{/snippet}
			<p class="text-sm">{i18n.t('design.demo.window')}</p>
		</Window>
	{/if}
</div>
