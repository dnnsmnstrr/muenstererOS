import { CONCERTS_GIST_ID } from '$lib/config.js';

export async function load({ fetch }) {
	const response = await fetch('/api/concerts');
	if (!response.ok) {
		return {
			concerts: [],
			updatedAt: null,
			gistId: CONCERTS_GIST_ID
		};
	}
	const data = await response.json();
	return {
		concerts: data.concerts || [],
		festivals: data.festivals || [],
		updatedAt: data.updatedAt,
		gistId: CONCERTS_GIST_ID,
		gistUrl: data.gistUrl
	};
}
