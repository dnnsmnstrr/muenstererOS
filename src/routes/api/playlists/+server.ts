import { json, error } from '@sveltejs/kit';
import { searchData } from '$lib/utils/api';

const SEASON_ORDER: Record<string, number> = { winter: 0, spring: 1, summer: 2, autumn: 3 };

function getMostRecentSeasonPlaylist(playlists: any[]) {
	return (
		playlists
			.filter((p: any) => p.type === 'season')
			.sort((a: any, b: any) => {
				if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
				return (SEASON_ORDER[b.season] ?? 0) - (SEASON_ORDER[a.season] ?? 0);
			})[0] ?? null
	);
}

export async function GET({ url, fetch }) {
	const type = url.searchParams.get('type');
	const search = url.searchParams.get('search')?.toLowerCase();
	const current = url.searchParams.get('current') === 'true';

	const response = await fetch('/api/gists/playlists');
	if (!response.ok) {
		throw error(response.status, 'Failed to fetch playlists from gist');
	}

	const data = await response.json();
	let filtered = data.playlists || [];

	if (current) {
		return json(getMostRecentSeasonPlaylist(filtered));
	}

	if (type) {
		filtered = filtered.filter((item: any) => item.type === type);
	}

	if (search) {
		filtered = searchData(filtered, search, ['title', 'description', 'emoji', 'season', 'year']);
	}

	return json(filtered);
}
