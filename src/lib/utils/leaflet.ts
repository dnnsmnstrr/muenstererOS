import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type * as Leaflet from 'leaflet';

export const HOME_COORDINATES: [number, number] = [50.0, 8.2711]; // Mainz

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
	'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

let leafletModule: Promise<typeof Leaflet> | null = null;

/**
 * Load Leaflet and its CSS on demand and apply the default marker icon fix once.
 */
export function loadLeaflet(): Promise<typeof Leaflet> {
	if (!leafletModule) {
		leafletModule = Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]).then(
			([mod]) => {
				const L: typeof Leaflet = (mod as any).default ?? mod;
				// Fix for Leaflet marker icon issue
				delete (L.Icon.Default.prototype as any)._getIconUrl;
				L.Icon.Default.mergeOptions({
					iconUrl: markerIcon,
					iconRetinaUrl: markerIcon2x,
					shadowUrl: markerShadow
				});
				return L;
			}
		);
	}
	return leafletModule;
}

/** Create a map with the standard OpenStreetMap tile layer. */
export function createOsmMap(
	L: typeof Leaflet,
	container: HTMLElement | string,
	center: [number, number] = HOME_COORDINATES,
	zoom = 4
) {
	const map = L.map(container).setView(center, zoom);
	L.tileLayer(OSM_TILE_URL, { attribution: OSM_ATTRIBUTION }).addTo(map);
	return map;
}
