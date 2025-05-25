<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from "$lib/components/ui/card";

	const endpoints = [
		{
			name: 'JSON Resume',
			method: 'GET',
			url: '/api/resume',
		},
		{
			name: 'Now Data',
			method: 'GET',
			url: '/api/now',
		},
        {
            name: 'Redirects',
            method: 'GET',
            url: '/api/redirects',
        }
	];

	let selected = 0;
	let response: any = null;
	let loading = false;
	let error: string | null = null;

	async function callEndpoint() {
		const endpoint = endpoints[selected];
		loading = true;
		error = null;
		response = null;
		try {
			const res = await fetch(endpoint.url, {
				method: endpoint.method,
				headers: { 'Content-Type': 'application/json' },			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			response = await res.json();
		} catch (e) {
			error = e.message;
		}
		loading = false;
	}
</script>

<div class="container mx-auto max-w-2xl p-4">
	<h1 class="text-2xl font-bold mb-4">API</h1>
	<div class="mb-4 flex items-end gap-2">
		<div class="flex-1">
			<label for="endpoint-select" class="block mb-2 font-semibold">Select endpoint to test the output:</label>
			<select id="endpoint-select" bind:value={selected} class="border rounded px-2 py-1 w-full h-9">
				{#each endpoints as ep, i}
					<option value={i}>{ep.method} {ep.url}</option>
				{/each}
			</select>
		</div>
		<Button 
			onclick={callEndpoint} 
			disabled={loading} 
			size="sm"
			class="w-32"
		>
			{loading ? 'Loading...' : 'Call Endpoint'}
		</Button>
	</div>
	
	{#if error}
		<div class="mt-4 text-red-600">Error: {error}</div>
	{/if}
	{#if response}
		<Card.Root class="mt-4 overflow-x-auto max-h-96">
			<Card.Content>
				<label for="api-response" class="block mb-2 font-semibold">Response:</label>
				<pre id="api-response" class="rounded-lg text-sm overflow-auto"><code>{JSON.stringify(response, null, 2)}</code></pre>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
