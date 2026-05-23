<script>
	import Loader from './../lib/components/Loader.svelte';
	import { page } from '$app/stores';
	import { getRedirect } from '$lib/utils/index';
	import { redirects } from '$lib/redirects';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { debugLog } from '$lib/stores/app';
	import { i18n } from '$lib/i18n/i18n.svelte';

	let loading = $state(true);

	onMount(() => {
		const query = $page.url.pathname.replace('/', '');
		const foundRedirect = getRedirect(query, redirects, { log: debugLog });
		const hasLoopedBack = window.location.search.includes('noRedirect');
		if (foundRedirect && !foundRedirect.toString().includes('404') && !hasLoopedBack && browser) {
			debugLog('redirecting to ' + foundRedirect);
			const isExternal = typeof foundRedirect === 'string' && foundRedirect.startsWith('http');
			window.location.replace(foundRedirect + (!isExternal ? '?noRedirect=true' : ''));
		} else {
			loading = false;
		}
	});
</script>

{#if loading}
	<Loader title={i18n.t('error.searching')} />
{:else}
	<h1>{$page.status}: {$page.error?.message}</h1>

	<span>
		{i18n.t('error.404')}
		{$page.url.pathname}
	</span>
{/if}
