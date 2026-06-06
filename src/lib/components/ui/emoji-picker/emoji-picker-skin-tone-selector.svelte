<script lang="ts">
	import { box } from 'svelte-toolbelt';
	import { useEmojiPickerSkinToneSelector } from './emoji-picker.svelte.js';
	import type { EmojiPickerSkinProps } from './types.js';
	import { Button, type ButtonProps } from '$lib/components/ui/button';
	import { cn } from '$lib/utils/utils';

	let {
		previewEmoji = '👋',
		variant = 'outline',
		size = 'icon',
		class: className,
		onclick,
		...rest
	}: EmojiPickerSkinProps = $props();

	const skinState = useEmojiPickerSkinToneSelector({
		previewEmoji: box.with(() => previewEmoji)
	});
</script>

<Button
	{...rest /* eslint-disable-line @typescript-eslint/no-explicit-any */ as any}
	{variant}
	{size}
	class={cn('size-8', className)}
	onclick={(e: any) => {
		onclick?.(e);
		skinState.cycleSkinTone();
	}}
>
	{skinState.preview}
</Button>
