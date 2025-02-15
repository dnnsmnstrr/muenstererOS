<script>
	import Loader from './../lib/components/Loader.svelte';
	import { page } from '$app/stores';
	import { getRedirect } from '$lib/utils/index';
	import { redirects } from '$lib/redirects';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { debugLog } from '$lib/stores/app';

	let loading = $state(true);

	onMount(() => {
		const query = $page.url.pathname.replace('/', '');
		const foundRedirect = getRedirect(query, redirects, { log: debugLog });
		if (foundRedirect && browser) {
			debugLog('redirecting to ' + foundRedirect);
			window.location.replace(foundRedirect + '?noRedirect=true');
		} else {
			loading = false;
		}
	});
</script>

{#if loading}
	<Loader title="Searching for redirect" />
{:else}
	<h1>{$page.status}: {$page.error?.message}</h1>

	<span>
		No redirect was found for: {$page.url.pathname}
	</span>
{/if}
