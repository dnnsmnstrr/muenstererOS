<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Plus, Trash2, ChevronDown, ChevronRight, ChevronsDown, ChevronsUp, ExternalLink } from 'lucide-svelte';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { cn } from '$lib/utils/utils';

	let { schema, data = $bindable() } = $props();

	let defaultOpen = $state(true);
	let openStates = $state<Record<string, boolean>>({});

	function setAllOpen(open: boolean) {
		openStates = {};
		defaultOpen = open;
	}

	function isValidUrl(str: string) {
		try {
			new URL(str);
			return true;
		} catch (_) {
			return false;
		}
	}

	function isUrlField(s: any, key: string | number, label: string) {
		if (s.format === 'uri' || s.format === 'url') return true;
		const keyStr = String(key).toLowerCase();
		const labelStr = String(label).toLowerCase();
		return (
			keyStr.includes('url') ||
			keyStr.includes('link') ||
			keyStr.includes('href') ||
			labelStr.includes('url') ||
			labelStr.includes('link') ||
			labelStr.includes('href')
		);
	}

	function formatForDateTimeLocal(val: string) {
		if (!val) return '';
		try {
			const d = new Date(val);
			if (isNaN(d.getTime())) return '';
			// Returns YYYY-MM-DDTHH:mm
			return d.toISOString().slice(0, 16);
		} catch (e) {
			return '';
		}
	}

	function resolveSchema(s: any): any {
		if (!s || !s.$ref) return s;

		const ref = s.$ref;
		if (ref.startsWith('#/')) {
			const parts = ref.split('/').slice(1);
			let current = schema;
			for (const part of parts) {
				if (current && current[part] !== undefined) {
					current = current[part];
				} else {
					console.warn(`Could not resolve ref: ${ref}`);
					return s;
				}
			}
			return { ...current, ...s, $ref: undefined };
		}
		return s;
	}

	function getInitialValue(s: any) {
		s = resolveSchema(s);
		if (!s) return null;
		if (s.default !== undefined) return JSON.parse(JSON.stringify(s.default));

		const type = s.type || (s.properties ? 'object' : (s.items ? 'array' : 'string'));

		switch (type) {
			case 'object':
				const obj: any = {};
				if (s.properties) {
					for (const [k, v] of Object.entries<any>(s.properties)) {
						obj[k] = getInitialValue(v);
					}
				}
				return obj;
			case 'array':
				return [];
			case 'string':
				return '';
			case 'number':
			case 'integer':
				return 0;
			case 'boolean':
				return false;
			default:
				return '';
		}
	}

	// Initialize missing data based on schema
	function initializeData(s: any, d: any) {
		s = resolveSchema(s);
		if (!s || !d) return;

		const type = s.type || (s.properties ? 'object' : (s.items ? 'array' : 'string'));

		if (type === 'object' && s.properties) {
			for (const [key, propSchema] of Object.entries<any>(s.properties)) {
				if (d[key] === undefined) {
					d[key] = getInitialValue(propSchema);
				} else {
					initializeData(propSchema, d[key]);
				}
			}
		} else if (type === 'array' && Array.isArray(d) && s.items) {
			for (const item of d) {
				initializeData(s.items, item);
			}
		}
	}

	$effect(() => {
		if (schema && data) {
			initializeData(schema, data);
		}
	});
</script>

{#snippet renderField(
	s_raw: any,
	obj: any,
	key: string | number,
	label: string,
	path: string,
	onDelete?: () => void
)}
	{@const s = resolveSchema(s_raw)}
	{#if obj && s}
		{@const type = s.type || (s.properties ? 'object' : (s.items ? 'array' : 'string'))}
		<div class="space-y-2">
			{#if type === 'object'}
				<Collapsible.Root
					open={openStates[path] ?? defaultOpen}
					onOpenChange={(v) => (openStates[path] = v)}
					class="rounded-lg border"
				>
					<div class="flex items-center justify-between p-4">
						<Collapsible.Trigger class="flex flex-1 items-center gap-2 text-left">
							{#snippet child({ props })}
								<button
									{...props}
									type="button"
									class={cn('flex flex-1 items-center gap-2', props.class as string)}
								>
									{#if openStates[path] ?? defaultOpen}
										<ChevronDown class="h-4 w-4" />
									{:else}
										<ChevronRight class="h-4 w-4" />
									{/if}
									<h3 class="text-sm font-semibold capitalize">{label}</h3>
								</button>
							{/snippet}
						</Collapsible.Trigger>
						{#if onDelete}
							<Button
								variant="ghost"
								size="icon"
								class="h-8 w-8 text-destructive hover:bg-destructive/10"
								onclick={(e) => {
									e.stopPropagation();
									onDelete();
								}}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						{/if}
					</div>
					<Collapsible.Content class="px-4 pb-4">
						<div class="grid gap-4">
							{#if obj[key]}
								{#each Object.entries(s.properties || {}) as [subKey, subSchema]}
									{@render renderField(subSchema, obj[key], subKey, subKey, `${path}.${subKey}`)}
								{/each}
							{/if}
						</div>
					</Collapsible.Content>
				</Collapsible.Root>
			{:else if type === 'array'}
				<Collapsible.Root
					open={openStates[path] ?? defaultOpen}
					onOpenChange={(v) => (openStates[path] = v)}
					class="rounded-lg border"
				>
					<div class="flex items-center justify-between p-4">
						<Collapsible.Trigger class="flex flex-1 items-center gap-2 text-left">
							{#snippet child({ props })}
								<button
									{...props}
									type="button"
									class={cn('flex flex-1 items-center gap-2', props.class as string)}
								>
									{#if openStates[path] ?? defaultOpen}
										<ChevronDown class="h-4 w-4" />
									{:else}
										<ChevronRight class="h-4 w-4" />
									{/if}
									<h3 class="text-sm font-semibold capitalize">{label}</h3>
								</button>
							{/snippet}
						</Collapsible.Trigger>
						<div class="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								data-add-button={label}
								onclick={(e) => {
									e.stopPropagation();
									if (!obj[key]) obj[key] = [];
									obj[key].push(getInitialValue(s.items));
								}}
							>
								<Plus class="mr-1 h-4 w-4" /> Add
							</Button>
							{#if onDelete}
								<Button
									variant="ghost"
									size="icon"
									class="h-8 w-8 text-destructive hover:bg-destructive/10"
									onclick={(e) => {
										e.stopPropagation();
										onDelete();
									}}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							{/if}
						</div>
					</div>
					<Collapsible.Content class="px-4 pb-4">
						<div class="space-y-4">
							{#if obj[key] && Array.isArray(obj[key])}
								{#each obj[key] as _, index}
									<div class="relative ml-2 space-y-2 border-l-2 pl-4">
										{@render renderField(
											s.items,
											obj[key],
											index,
											`${label} item ${index + 1}`,
											`${path}[${index}]`,
											() => {
												obj[key].splice(index, 1);
											}
										)}
									</div>
								{/each}
							{/if}
						</div>
					</Collapsible.Content>
				</Collapsible.Root>
			{:else}
				<div class="grid gap-1.5">
					<div class="flex items-center justify-between">
						<Label class="capitalize" for={path}>{label}</Label>
						{#if onDelete}
							<Button
								variant="ghost"
								size="icon"
								class="h-8 w-8 text-destructive hover:bg-destructive/10"
								onclick={(e) => {
									e.stopPropagation();
									onDelete();
								}}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						{/if}
					</div>
					{#if type === 'string'}
						{#if s.enum}
							<select
								id={path}
								bind:value={obj[key]}
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								{#each s.enum as option}
									<option value={option}>{option}</option>
								{/each}
							</select>
						{:else if s.format === 'date-time'}
							<Input
								id={path}
								type="datetime-local"
								class="h-10 w-full min-w-0"
								value={formatForDateTimeLocal(obj[key])}
								oninput={(e) => (obj[key] = (e.target as HTMLInputElement).value)}
							/>
						{:else if isUrlField(s, key, label)}
							<div class="flex gap-2">
								<Input id={path} bind:value={obj[key]} placeholder={s.description || ''} />
								<Button
									variant="outline"
									size="icon"
									disabled={!isValidUrl(obj[key])}
									onclick={() => window.open(obj[key], '_blank', 'noopener,noreferrer')}
									title="Open Link"
								>
									<ExternalLink class="h-4 w-4" />
								</Button>
							</div>
							{#if obj[key] && !isValidUrl(obj[key])}
								<p class="text-xs text-destructive">Please enter a valid URL.</p>
							{/if}
						{:else}
							<Input id={path} bind:value={obj[key]} placeholder={s.description || ''} />
						{/if}
					{:else if type === 'number' || type === 'integer'}
						<Input
							id={path}
							type="number"
							bind:value={obj[key]}
							step={type === 'integer' ? '1' : 'any'}
						/>
					{:else if type === 'boolean'}
						<div class="flex items-center space-x-2 py-2">
							<Checkbox id={path} bind:checked={obj[key]} />
							<Label for={path} class="cursor-pointer text-sm font-medium leading-none">
								{s.description || label}
							</Label>
						</div>
					{/if}
					{#if s.description && type !== 'boolean'}
						<p class="text-xs text-muted-foreground">{s.description}</p>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
{/snippet}

<div class="space-y-6">
	{#if schema && (schema.type === 'object' || schema.properties) && data}
		<div class="flex justify-end gap-2">
			<Button variant="outline" size="sm" onclick={() => setAllOpen(true)}>
				<ChevronsDown class="mr-2 h-4 w-4" />
				Expand All
			</Button>
			<Button variant="outline" size="sm" onclick={() => setAllOpen(false)}>
				<ChevronsUp class="mr-2 h-4 w-4" />
				Collapse All
			</Button>
		</div>
		<div class="grid gap-6">
			{#each Object.entries(schema.properties || {}) as [key, s]}
				{@render renderField(s, data, key, key, key)}
			{/each}
		</div>
	{:else if schema}
		<p class="text-destructive">Only object-type root schemas are supported currently.</p>
	{/if}
</div>
