<script lang="ts">
	import * as EmojiPicker from '$lib/components/ui/emoji-picker';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { Smile } from 'lucide-svelte';

	let {
		value = $bindable(''),
		onSelect,
		class: className,
		showLast = true
	}: {
		value?: string;
		onSelect?: (emoji: string) => void;
		class?: string;
		showLast?: boolean;
	} = $props();

	let open = $state(false);
</script>

<EmojiPicker.Root
	bind:value
	onSelect={(v) => {
		open = false;
		value = v.emoji;
		onSelect?.(v.emoji);
	}}
	showRecents
	recentsKey="pap-emoji-recents"
>
	<Popover.Root bind:open>
		<Popover.Trigger asChild>
			{#snippet child({ props })}
				<Button variant="ghost" size="sm" {...props} class={className}>
					{#if value && showLast}
						<span class="text-lg leading-none">{value}</span>
					{:else}
						<Smile size={20} />
					{/if}
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0" align="start">
			<EmojiPicker.Viewport>
				<EmojiPicker.Search />
				<EmojiPicker.List />
				<EmojiPicker.Footer>
					{#snippet children({ active })}
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								{#if active}
									<span class="text-2xl">{active.emoji}</span>
									<span class="text-xs text-muted-foreground">:{active.data.id}:</span>
								{:else}
									<Smile class="size-5 text-muted-foreground" />
									<span class="text-xs text-muted-foreground">Select an emoji...</span>
								{/if}
							</div>
							<EmojiPicker.SkinToneSelector />
						</div>
					{/snippet}
				</EmojiPicker.Footer>
			</EmojiPicker.Viewport>
		</Popover.Content>
	</Popover.Root>
</EmojiPicker.Root>
