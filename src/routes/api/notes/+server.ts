import { gistCache } from '$lib/server/cache';
import { json } from '@sveltejs/kit';

const CACHE_KEY = 'notes_list';
const CACHE_TTL = 60 * 60; // 1 hour

export async function GET({ fetch }) {
	const cachedData = gistCache.get(CACHE_KEY);
	if (cachedData) {
		return json(cachedData);
	}

	try {
		const response = await fetch(
			'https://api.github.com/repos/dnnsmnstrr/zettelkasten/contents/notes'
		);

		if (!response.ok) {
			throw new Error('Failed to fetch notes from GitHub');
		}

		const data = await response.json();
		const notes = data
			.filter((file: any) => file.name.endsWith('.md'))
			.map((file: any) => ({
				name: file.name.replace('.md', ''),
				path: file.path,
				sha: file.sha
			}));

		gistCache.set(CACHE_KEY, notes, CACHE_TTL);

		return json(notes);
	} catch (err) {
		console.error('Notes fetch error:', err);
		return json({ error: 'Failed to fetch notes' }, { status: 500 });
	}
}
