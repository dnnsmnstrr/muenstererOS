<script lang="ts">
	import { File as FileIcon } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import type { ComponentType } from 'svelte';

	let {
		name = 'untitled',
		icon,
		class: className,
		...restProps
	}: {
		name?: string;
		href?: string | null;
		icon?: ComponentType;
		class?: string;
		[key: string]: any;
	} = $props();

	let Icon = $derived(icon || FileIcon);
</script>

<div class={cn('block text-sm transition-all pointer-events-none', className)}>
	<div class="inline-flex flex-col items-center justify-center" {...restProps}>
		<Icon size={40} />
		<span>{name}</span>
	</div>
</div>
