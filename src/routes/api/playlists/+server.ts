import { json, error } from '@sveltejs/kit';
import { searchData } from '$lib/utils/api';

export async function GET({ url, fetch }) {
	const type = url.searchParams.get('type');
	const search = url.searchParams.get('search')?.toLowerCase();

	const response = await fetch('/api/gists/playlists');
	if (!response.ok) {
		throw error(response.status, 'Failed to fetch playlists from gist');
	}

	const data = await response.json();
	let filtered = data.playlists || [];

	if (type) {
		filtered = filtered.filter((item: any) => item.type === type);
	}

	if (search) {
		filtered = searchData(filtered, search, ['title', 'description', 'emoji', 'season', 'year']);
	}

	return json(filtered);
}
