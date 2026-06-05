<script lang="ts">
	import * as LucideIcons from 'lucide-svelte';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Search } from 'lucide-svelte';
	import type { Component } from 'svelte';

	let {
		value = $bindable('Info'),
		onSelect,
		clearOnSelect = false
	}: {
		value?: string;
		onSelect?: (icon: string) => void;
		clearOnSelect?: boolean;
	} = $props();

	const allIconNames = Object.keys(LucideIcons)
		.filter(
			(key) =>
				typeof (LucideIcons as any)[key] === 'function' ||
				typeof (LucideIcons as any)[key] === 'object'
		)
		.sort();

	let searchQuery = $state('');

	const filteredIcons = $derived(
		allIconNames.filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	function handleSelect(name: string) {
		value = name;
		onSelect?.(name);
		// Reset value to allow selecting the same icon again
		if (clearOnSelect) {
			setTimeout(() => {
				value = '';
			}, 100);
		}
	}
</script>

<div class="space-y-2">
	<Select.Root
		type="single"
		bind:value
		onValueChange={(v) => {
			if (v) handleSelect(v);
		}}
	>
		<Select.Trigger class="w-full" asChild>
			{#snippet children(params)}
				{@const triggerProps = params?.props || {}}
				<button {...triggerProps} class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
					<div class="flex items-center gap-2">
						{#if value && (LucideIcons as any)[value]}
							{@const Icon = (LucideIcons as any)[value] as Component}
							<Icon size={16} />
						{/if}
						<span>{value || 'Select icon...'}</span>
					</div>
				</button>
			{/snippet}
		</Select.Trigger>
		<Select.Content class="max-h-80">
			<div class="sticky top-0 z-10 bg-popover p-2">
				<div class="relative">
					<Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input placeholder="Search icons..." bind:value={searchQuery} class="pl-8 h-9" />
				</div>
			</div>
			<div class="overflow-y-auto">
				{#each filteredIcons.slice(0, 100) as name}
					{@const Icon = (LucideIcons as any)[name] as Component}
					<Select.Item value={name} label={name}>
						<div class="flex items-center gap-2">
							<Icon size={16} />
							<span>{name}</span>
						</div>
					</Select.Item>
				{/each}
				{#if filteredIcons.length > 100}
					<div class="p-2 text-center text-xs text-muted-foreground">
						Showing first 100 of {filteredIcons.length} icons
					</div>
				{/if}
				{#if filteredIcons.length === 0}
					<div class="p-4 text-center text-sm text-muted-foreground">No icons found</div>
				{/if}
			</div>
		</Select.Content>
	</Select.Root>
</div>
