import { json } from '@sveltejs/kit';
import playlists from '../../../../static/data/playlists.json';

export async function GET({ url }) {
	const type = url.searchParams.get('type');
	const search = url.searchParams.get('search')?.toLowerCase();

	let filtered = playlists;

	if (type) {
		filtered = filtered.filter((item: any) => item.type === type);
	}

	if (search) {
		filtered = filtered.filter(
			(item: any) =>
				(item.title && item.title.toLowerCase().includes(search)) ||
				(item.emoji && item.emoji.toLowerCase().includes(search))
		);
	}

	return json(filtered);
}
