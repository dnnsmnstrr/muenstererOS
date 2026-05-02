import { gists } from '$lib/config';
import { gistCache } from '$lib/server/cache';
import { json } from '@sveltejs/kit';

const CACHE_TTL = 15 * 60; // 15 minutes in seconds

export async function GET({ params, url }) {
	const { name } = params;
	const refresh = url.searchParams.get('refresh') === 'true';

	const gist = gists[name as keyof typeof gists];
	if (!gist) {
		return json({ error: 'Gist not found for name: ' + name }, { status: 404 });
	}

	if (!refresh) {
		const cachedData = gistCache.get(name);
		if (cachedData) {
			return json(cachedData);
		}
	}

	const gistApiUrl = `https://api.github.com/gists/${gist.id}`;

	try {
		const response = await fetch(gistApiUrl);

		if (!response.ok) {
			throw new Error('Failed to fetch data from GitHub');
		}

		const apiData = await response.json();
		const gistData = JSON.parse(apiData.files[gist.filename].content);
		const updatedAt = apiData.updated_at;
		const versions = apiData.history.map((item: any) => ({
			...item,
			timestamp: item.committed_at,
			changes: item.change_status?.total
		}));

		const responseData = { ...gistData, updatedAt, gistUrl: apiData.html_url, versions };

		// Update cache
		gistCache.set(name, responseData, CACHE_TTL);

		return json(responseData);
	} catch (error) {
		return json({ error }, { status: 500 });
	}
}
