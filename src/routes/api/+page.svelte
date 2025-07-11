<script module lang="ts">
	interface Endpoint {
		name: string;
		url: string;
		method?: string;
		options?: string[];
		types?: string[];
	}

	const defaultJsonOptions = ['search', 'sortBy', 'direction', 'page', 'limit'];
	export const endpoints: Endpoint[] = [
		{
			name: 'Dennis',
			url: '/api/dennis'
		},
		{
			name: 'Now Data',
			url: '/api/now'
		},
		{
			name: 'Pages',
			url: '/api/pages',
			options: defaultJsonOptions
		},
		{
			name: 'Changelog',
			url: '/api/changes',
			options: defaultJsonOptions
		},
		{
			name: 'Redirects',
			url: '/api/redirects',
			options: ['search', 'type'],
			types: ['internal', 'external']
		},
		{
			name: 'Playlists',
			url: '/api/playlists',
			options: ['search', 'type'],
			types: ['season', 'theme']
		},
		{
			name: 'Uses',
			url: '/api/uses',
			options: defaultJsonOptions
		},
		{
			name: 'JSON Resume',
			url: '/api/resume'
		}
	];
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronDown } from 'lucide-svelte';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import JsonView from '$lib/components/JsonView.svelte';
	import { Heading } from '$lib/components/typography';

	let selected = 0;
	let response: any = null;
	let loading = false;
	let error: string | null = null;
	let queryParams: Record<string, string> = {};
	let paramsOpen = false;

	function buildUrl(baseUrl: string, params: Record<string, string>): string {
		const url = new URL(baseUrl, window.location.origin);
		Object.entries(params).forEach(([key, value]) => {
			const trimmedValue = typeof value === 'string' ? value.trim() : value;
			if (trimmedValue) {
				url.searchParams.set(key, trimmedValue);
			}
		});
		return url.toString();
	}

	async function callEndpoint() {
		const endpoint = endpoints[selected];
		loading = true;
		error = null;
		response = null;
		try {
			const url = buildUrl(endpoint.url, queryParams);
			const res = await fetch(url, {
				method: endpoint.method || 'GET',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			response = await res.json();
		} catch (e: any) {
			error = e.message;
		}
		loading = false;
	}

	function clearParams() {
		queryParams = {};
	}

	$: currentEndpoint = endpoints[selected];
	$: if (selected !== undefined) {
		clearParams();
		callEndpoint();
	}
</script>

<div class="container mx-auto max-w-2xl p-4">
	<Heading>API</Heading>
	<div class="mb-4">
		<label for="endpoint-select" class="mb-2 block font-semibold">
			Select endpoint to test the output:
		</label>
		<select id="endpoint-select" bind:value={selected} class="h-9 w-full rounded border px-2 py-1">
			{#each endpoints as ep, i}
				<option value={i}>{ep?.method || 'GET'} {ep.url}</option>
			{/each}
		</select>
	</div>

	{#if currentEndpoint.options && currentEndpoint.options.length > 0}
		<Card.Root class="mb-4">
			<Collapsible.Root bind:open={paramsOpen}>
				<Card.Header class="p-0">
					<Collapsible.Trigger class="p-0">
						<Button
							variant="ghost"
							class="w-full justify-between p-6 font-semibold hover:bg-transparent"
						>
							Query Parameters
							<ChevronDown
								class="h-4 w-4 transition-transform duration-200 {paramsOpen ? 'rotate-180' : ''}"
							/>
						</Button>
					</Collapsible.Trigger>
				</Card.Header>
				<Collapsible.Content>
					<Card.Content>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{#each currentEndpoint.options as option}
								<div>
									<label for={option} class="mb-1 block text-sm font-medium">
										<span class="capitalize">{option}</span>
										{#if option === 'direction'}
											<span class="text-xs text-muted-foreground">(asc/desc)</span>
										{:else if option === 'type' && currentEndpoint?.types}
											<span class="text-xs text-muted-foreground"
												>({currentEndpoint?.types?.join(', ') || ''})</span
											>
										{:else if option === 'page' || option === 'limit'}
											<span class="text-xs text-muted-foreground">(number)</span>
										{/if}
									</label>
									{#if option === 'type' && currentEndpoint.types}
										<CustomSelect
											name="Direction"
											value={queryParams[option]}
											emptyItem="-"
											placeholder={'select ' + option}
											options={currentEndpoint.types.map((type) => ({ label: type, value: type }))}
											onValueChange={(value) => (queryParams[option] = value)}
										/>
									{:else if option === 'direction'}
										<CustomSelect
											name="Direction"
											value={queryParams[option]}
											options={[
												{ value: '', label: '-' },
												{ value: 'asc', label: 'Ascending' },
												{ value: 'desc', label: 'Descending' }
											]}
											onValueChange={(value) => (queryParams[option] = value)}
										/>
									{:else}
										<Input
											id={option}
											bind:value={queryParams[option]}
											type={option === 'page' || option === 'limit' ? 'number' : 'text'}
											onkeydown={(e) => {
												if (e.key === 'Enter') callEndpoint();
											}}
											placeholder={option}
											class="w-full"
										/>
									{/if}
								</div>
							{/each}
						</div>
						<div class="mt-4 flex gap-2">
							<Button onclick={clearParams} variant="outline" size="sm">Clear Parameters</Button>
						</div>
					</Card.Content>
				</Collapsible.Content>
			</Collapsible.Root>
		</Card.Root>
	{/if}

	<div class="mb-4">
		<Button onclick={callEndpoint} disabled={loading} class="w-full">
			{loading ? 'Loading...' : 'Call Endpoint'}
		</Button>
	</div>

	{#if error}
		<div class="mt-4 text-red-600">Error: {error}</div>
	{/if}
	{#if response}
		<Card.Root class="mt-4 max-h-96">
			<Tabs.Root value="response">
				<Tabs.List class="flex">
					<Tabs.Trigger value="response">Response</Tabs.Trigger>
					<Tabs.Trigger value="json">JSON Viewer</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="response">
					<Card.Content class="max-h-80 overflow-auto rounded-lg text-sm">
						<pre>
							<code>{'\n'}{JSON.stringify(response, null, 2)}</code>
						</pre>
					</Card.Content>
				</Tabs.Content>
				<Tabs.Content value="json">
					<Card.Content class="max-h-80 overflow-auto pb-4">
						<JsonView data={response} />
					</Card.Content>
				</Tabs.Content>
			</Tabs.Root>
		</Card.Root>
	{/if}
</div>
