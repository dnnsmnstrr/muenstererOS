<script>
	import { onMount } from 'svelte';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { browser } from '$app/environment';
	import { Card } from '$lib/components/ui/card';
	import Heading from '$lib/components/typography/Heading.svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';

	let map;

	onMount(() => {
		if (browser) {
			map = L.map('map').setView([50.0, 8.2711], 13); // Coordinates for Mainz

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);

			L.marker([50.0, 8.2711]).addTo(map);
		}
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

	<Card class="h-96 z-0" id="map" />
</div>
