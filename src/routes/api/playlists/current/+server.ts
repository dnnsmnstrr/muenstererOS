import { redirect, error } from '@sveltejs/kit';

export async function GET({ fetch }) {
	const response = await fetch('/api/playlists');
	if (!response.ok) {
		throw error(response.status, 'Failed to fetch playlists');
	}

	const playlists = await response.json();

	if (playlists && playlists.length > 0) {
		const firstPlaylist = playlists[0];
		throw redirect(302, `https://open.spotify.com/playlist/${firstPlaylist.uri}`);
	}

	throw redirect(302, '/playlists');
}
