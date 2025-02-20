<script>
    import { onMount } from 'svelte';
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';
	import { browser } from '$app/environment';
	import { Card } from '$lib/components/ui/card';
	import Heading from '$lib/components/typography/Heading.svelte';

    let map;

    onMount(() => {
        if (browser) {
            map = L.map('map').setView([50.0, 8.2711], 13); // Coordinates for Mainz
    
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
    
            L.marker([50.0, 8.2711]).addTo(map)
        }
    });
</script>

<div class="container">
    <Heading>
        Where I am right now
        <span class="text-xs text-gray-500">(roughly)</span>
    </Heading>

    <Card class="h-96" id="map" />
</div>