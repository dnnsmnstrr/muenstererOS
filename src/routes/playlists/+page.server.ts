export async function load({ fetch }) {
	const response = await fetch('/api/playlists');
	if (!response.ok) {
		throw new Error('Failed to fetch playlist data');
	}
	const playlists = await response.json();
	return {
		playlists
	};
}
