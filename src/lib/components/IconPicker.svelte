<script lang="ts">
	import * as LucideIcons from 'lucide-svelte';
	import * as Select from '$lib/components/ui/select';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Search } from 'lucide-svelte';
	import type { Component } from 'svelte';

	let {
		value = $bindable('Info'),
		onSelect,
		clearOnSelect = false,
		class: className,
		triggerMode = 'select'
	}: {
		value?: string;
		onSelect?: (icon: string) => void;
		clearOnSelect?: boolean;
		class?: string;
		triggerMode?: 'select' | 'button';
	} = $props();

	const allIconNames = [
		'favicon',
		...Object.keys(LucideIcons)
			.filter(
				(key) =>
					(typeof (LucideIcons as any)[key] === 'function' ||
						typeof (LucideIcons as any)[key] === 'object') &&
					/^[A-Z]/.test(key) &&
					key !== 'createLucideIcon'
			)
			.sort()
	];

	let searchQuery = $state('');
	let open = $state(false);

	const filteredIcons = $derived(
		allIconNames.filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	function handleSelect(name: string) {
		value = name;
		onSelect?.(name);
		open = false;
		// Reset value to allow selecting the same icon again
		if (clearOnSelect) {
			setTimeout(() => {
				value = '';
			}, 100);
		}
	}
</script>

{#if triggerMode === 'select'}
	<Select.Root
		type="single"
		bind:value
		onValueChange={(v) => {
			if (v) handleSelect(v);
		}}
	>
		<div class={className}>
		<Select.Trigger class="w-full">
			<div class="flex items-center gap-2">
				{#if value === 'favicon'}
					<img src="/images/muenstererOS.svg" alt="favicon" class="h-4 w-4" />
				{:else if value && (LucideIcons as any)[value]}
					{@const Icon = (LucideIcons as any)[value] as Component}
					<Icon size={16} />
				{/if}
				<span>{value || 'Select icon...'}</span>
			</div>
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
					{#if name === 'favicon'}
						<Select.Item value={name} label={name}>
							<div class="flex items-center gap-2">
								<img src="/images/muenstererOS.svg" alt="favicon" class="h-4 w-4" />
								<span>{name}</span>
							</div>
						</Select.Item>
					{:else}
						{@const Icon = (LucideIcons as any)[name] as Component}
						{#if Icon}
							<Select.Item value={name} label={name}>
								<div class="flex items-center gap-2">
									<Icon size={16} />
									<span>{name}</span>
								</div>
							</Select.Item>
						{/if}
					{/if}
					<span>{value || 'Select icon...'}</span>
				</div>
			</Select.Trigger>
			<Select.Content class="max-h-80">
				<div class="sticky top-0 z-10 bg-popover p-2">
					<div class="relative">
						<Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input placeholder="Search icons..." bind:value={searchQuery} class="h-9 pl-8" />
					</div>
				</div>
				<div class="overflow-y-auto">
					{#each filteredIcons.slice(0, 100) as name}
						{@const Icon = (LucideIcons as any)[name] as Component}
						{#if Icon}
							<Select.Item value={name} label={name}>
								<div class="flex items-center gap-2">
									<Icon size={16} />
									<span>{name}</span>
								</div>
							</Select.Item>
						{/if}
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
		</div>
	</Select.Root>
{:else}
	<Popover.Root bind:open>
		<Popover.Trigger class={className}>
			{#snippet child({ props })}
				<Button variant="ghost" size="sm" {...props}>
					{#if value && (LucideIcons as any)[value]}
						{@const Icon = (LucideIcons as any)[value] as Component}
						<Icon size={16} />
					{:else}
						<Search size={16} />
					{/if}
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-72 p-0" align="start">
			<div class="flex flex-col">
				<div class="p-2">
					<div class="relative">
						<Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input placeholder="Search icons..." bind:value={searchQuery} class="h-9 pl-8" />
					</div>
				</div>
				<div class="max-h-80 overflow-y-auto p-1">
					<div class="grid grid-cols-4 gap-1">
						{#each filteredIcons.slice(0, 100) as name}
							{@const Icon = (LucideIcons as any)[name] as Component}
							{#if Icon}
								<Button
									variant="ghost"
									size="icon"
									class="h-10 w-10"
									onclick={() => handleSelect(name)}
									title={name}
								>
									<Icon size={20} />
								</Button>
							{/if}
						{/each}
					</div>
					{#if filteredIcons.length > 100}
						<div class="p-2 text-center text-xs text-muted-foreground">
							Showing first 100 of {filteredIcons.length} icons
						</div>
					{/if}
					{#if filteredIcons.length === 0}
						<div class="p-4 text-center text-sm text-muted-foreground">No icons found</div>
					{/if}
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>
{/if}
