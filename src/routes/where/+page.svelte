<script>
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui/card';
	import Heading from '$lib/components/typography/Heading.svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { loadLeaflet, createOsmMap, HOME_COORDINATES } from '$lib/utils/leaflet';
	import AirplaneOverlay from '$lib/components/AirplaneOverlay.svelte';

	let map;

	onMount(async () => {
		const L = await loadLeaflet();
		map = createOsmMap(L, 'map', HOME_COORDINATES, 13);
		L.marker(HOME_COORDINATES).addTo(map);
	});
</script>

<svelte:head>
	<title>{i18n.t('where.title')}{PAGE_TITLE_SUFFIX}</title>
	<meta name="description" content={i18n.t('where.description')} />
</svelte:head>

<div class="container">
	<Heading>
		{i18n.t('where.title')}
		<span class="text-xs font-normal text-muted-foreground">{i18n.t('where.roughly')}</span>
	</Heading>

	<div class="relative">
		<Card class="h-96 z-0" id="map" />
		<AirplaneOverlay />
	</div>
</div>
