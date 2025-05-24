<script lang="ts">
	// List your API endpoints and example requests here
	const endpoints = [
		{
			name: 'Now Data',
			method: 'GET',
			url: '/api/now',
			example: null
		},
        {
            name: 'Redirects',
            method: 'GET',
            url: '/api/redirects',
            example: null
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
				headers: { 'Content-Type': 'application/json' },
				body: endpoint.example ? JSON.stringify(endpoint.example) : undefined
			});
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
	<div class="mb-4">
		<label for="endpoint-select" class="block mb-2 font-semibold">Select endpoint:</label>
		<select id="endpoint-select" bind:value={selected} class="border rounded px-2 py-1 w-full">
			{#each endpoints as ep, i}
				<option value={i}>{ep.method} {ep.url}</option>
			{/each}
		</select>
	</div>
	{#if endpoints[selected].example}
		<div class="mb-4">
			<label for="example-request-body" class="block mb-2 font-semibold">Example request body:</label>
			<pre id="example-request-body" class="bg-gray-100 rounded p-2 text-sm">{JSON.stringify(endpoints[selected].example, null, 2)}</pre>
		</div>
	{/if}
	<button
		class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
		on:click={callEndpoint}
		disabled={loading}
	>
		{loading ? 'Loading...' : 'Call Endpoint'}
	</button>
	{#if error}
		<div class="mt-4 text-red-600">Error: {error}</div>
	{/if}
	{#if response}
		<div class="mt-4 overflow-x-auto max-h-96">
			<label for="api-response" class="block mb-2 font-semibold">Response:</label>
			<pre id="api-response" class="rounded p-2 text-sm">{JSON.stringify(response, null, 2)}</pre>
		</div>
	{/if}
</div>
