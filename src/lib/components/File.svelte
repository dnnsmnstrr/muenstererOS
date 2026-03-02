<script lang="ts">
	import { File as FileIcon } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import type { ComponentType } from 'svelte';

	let {
		name = 'untitled',
		icon,
		size = 60,
		class: className,
		...restProps
	}: {
		name?: string;
		href?: string | null;
		icon?: ComponentType;
		size?: number;
		class?: string;
		[key: string]: any;
	} = $props();

	let Icon = $derived(icon || FileIcon);
	let iconSize = $derived(Math.round(size * 0.66));
</script>

<div
	class={cn('block text-sm transition-all pointer-events-none', className)}
	style="width: {size}px; height: {size}px;"
>
	<div class="flex h-full w-full flex-col items-center justify-center gap-1" {...restProps}>
		<Icon size={iconSize} />
		<span class="truncate w-full text-center px-1" style="font-size: {Math.max(10, Math.round(size * 0.2))}px;">{name}</span>
	</div>
</div>
