<script module lang="ts">
	interface Endpoint {
		name: string;
		url: string;
		method?: string;
	}
	export const endpoints: Endpoint[] = [
		{
			name: 'Dennis',
			url: '/api/dennis'
		},
		{
			name: 'JSON Resume',
			url: '/api/resume'
		},
		{
			name: 'Now Data',
			url: '/api/now'
		},
		{
			name: 'Redirects',
			url: '/api/redirects'
		},
		{
			name: 'Playlists',
			url: '/api/playlists'
		}
	];
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { E } from 'vitest/dist/chunks/environment.d8YfPkTm.js';

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
				method: endpoint.method || 'GET',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			response = await res.json();
		} catch (e: Error) {
			error = e.message;
		}
		loading = false;
	}
</script>

<div class="container mx-auto max-w-2xl p-4">
	<h1 class="mb-4 text-2xl font-bold">API</h1>
	<div class="mb-4 flex items-end gap-2">
		<div class="flex-1">
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
		<Button onclick={callEndpoint} disabled={loading} size="sm" class="w-32">
			{loading ? 'Loading...' : 'Call Endpoint'}
		</Button>
	</div>

	{#if error}
		<div class="mt-4 text-red-600">Error: {error}</div>
	{/if}
	{#if response}
		<Card.Root class="mt-4 max-h-96 overflow-x-auto">
			<Card.Content>
				<label for="api-response" class="mb-2 block font-semibold">Response:</label>
				<pre id="api-response" class="overflow-auto rounded-lg text-sm">
					<code>{JSON.stringify(response, null, 2)}</code>
				</pre>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
