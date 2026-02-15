import { json } from '@sveltejs/kit';
import playlists from '../../../data/playlists.json';
import { searchData } from '$lib/utils/api';

export async function GET({ url }) {
	const type = url.searchParams.get('type');
	const search = url.searchParams.get('search')?.toLowerCase();

	let filtered = playlists;

	if (type) {
		filtered = filtered.filter((item: any) => item.type === type);
	}

	if (search) {
		filtered = searchData(filtered, search, ['title', 'description', 'emoji', 'season', 'year']);
	}

	return json(filtered);
}
