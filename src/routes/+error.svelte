<script>
	import Loader from './../lib/components/Loader.svelte';
	import { page } from '$app/state';
	import { getRedirect } from '$lib/utils/redirect';
	import { redirects } from '$lib/redirects';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { trackRedirect } from '$lib/utils/analytics';

	// During SSR there is no window, so show the error content immediately.
	// On the client, onMount will attempt a redirect lookup first.
	let loading = $state(browser);

	onMount(() => {
		const query = page.url.pathname.replace('/', '');
		const foundRedirect = getRedirect(query, redirects);
		const hasLoopedBack = window.location.search.includes('noRedirect');
		if (foundRedirect && !foundRedirect.toString().includes('404') && !hasLoopedBack) {
			const isExternal = typeof foundRedirect === 'string' && foundRedirect.startsWith('http');
			const redirectObj = getRedirect(query, redirects, { returnObject: true });
			const name = (typeof redirectObj === 'object' && redirectObj?.name) ? redirectObj.name : query;

			trackRedirect(name, () => {
				window.location.replace(foundRedirect + (!isExternal ? '?noRedirect=true' : ''));
			});
		} else {
			loading = false;
		}
	});
</script>

{#if loading}
	<Loader title={i18n.t('error.searching')} />
{:else}
	<h1>{page.status}: {page.error?.message}</h1>

	<span>
		{i18n.t('error.404')}
		{page.url.pathname}
	</span>
{/if}
