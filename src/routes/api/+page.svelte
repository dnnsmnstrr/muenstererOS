<script module lang="ts">
	interface Endpoint {
		name: string;
		url: string;
		method?: string;
		options?: string[];
	}
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
		},
		{
			name: 'Changelog',
			url: '/api/changes',
		},
		{
			name: 'Redirects',
			url: '/api/redirects',
			options: ['search', 'type']
		},
		{
			name: 'Playlists',
			url: '/api/playlists',
			options: ['search', 'type']
		},
		{
			name: 'Uses',
			url: '/api/uses',
			options: ['search', 'sortBy', 'direction', 'page', 'limit']
		},	
		{
			name: 'JSON Resume',
			url: '/api/resume'
		},
	];
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';

	let selected = 0;
	let response: any = null;
	let loading = false;
	let error: string | null = null;
	let queryParams: Record<string, string> = {};

	function buildUrl(baseUrl: string, params: Record<string, string>): string {
		const url = new URL(baseUrl, window.location.origin);
		Object.entries(params).forEach(([key, value]) => {
			if (value.trim()) {
				url.searchParams.set(key, value.trim());
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
	}
</script>

<div class="container mx-auto max-w-2xl p-4">
	<h1 class="mb-4 text-2xl font-bold">API</h1>
	<div class="mb-4">
		<label for="endpoint-select" class="mb-2 block font-semibold">
			Select endpoint to test the output:
		</label>
		<select
			id="endpoint-select"
			bind:value={selected}
			class="h-9 w-full rounded border px-2 py-1"
		>
			{#each endpoints as ep, i}
				<option value={i}>{ep?.method || 'GET'} {ep.url}</option>
			{/each}
		</select>
	</div>

	{#if currentEndpoint.options && currentEndpoint.options.length > 0}
		<Card.Root class="mb-4">
			<Card.Header>
				<Card.Title>Query Parameters</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each currentEndpoint.options as option}
						<div>
							<label for={option} class="mb-1 block text-sm font-medium capitalize">
								{option}
								{#if option === 'dir'}
									<span class="text-xs text-muted-foreground">(asc/desc)</span>
								{:else if option === 'page' || option === 'limit'}
									<span class="text-xs text-muted-foreground">(number)</span>
								{/if}
							</label>
							<Input
								id={option}
								bind:value={queryParams[option]}
								placeholder={option === 'search' ? 'Search term...' : 
											option === 'sortBy' ? 'Field name...' :
											option === 'direction' ? 'asc or desc' :
											option === 'page' ? '1' :
											option === 'limit' ? '50' :
											`${option}...`}
								class="w-full"
							/>
						</div>
					{/each}
				</div>
				<div class="mt-4 flex gap-2">
					<Button onclick={clearParams} variant="outline" size="sm">
						Clear Parameters
					</Button>
				</div>
			</Card.Content>
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
			<Card.Content>
				<label for="api-response" class="mb-2 block font-semibold">Response:</label>
				<pre id="api-response" class="max-h-80 overflow-auto rounded-lg text-sm">
					<code>{'\n'}{JSON.stringify(response, null, 2)}</code>
				</pre>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
