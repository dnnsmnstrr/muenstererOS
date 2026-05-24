import { gists, USERNAME_SHORT } from '$lib/config';
import { gistCache } from '$lib/server/cache';
import { json } from '@sveltejs/kit';

const CACHE_TTL = 15 * 60; // 15 minutes in seconds

export async function GET({ params, url, request, fetch }) {
	const { name } = params;
	const refresh = url.searchParams.get('refresh') === 'true';

	if (refresh) {
		const authHeader = request.headers.get('Authorization');
		if (!authHeader) {
			return json({ error: 'Unauthorized: Refresh requires admin token' }, { status: 401 });
		}
		try {
			const userRes = await fetch('https://api.github.com/user', {
				headers: { Authorization: authHeader }
			});
			const userData = await userRes.json();
			if (!userRes.ok || userData.login !== USERNAME_SHORT) {
				return json({ error: 'Forbidden: Admin access required' }, { status: 403 });
			}
		} catch (err) {
			return json({ error: 'Authentication failed' }, { status: 500 });
		}
	}

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
	} catch (err: any) {
		return json({ error: err.message || err }, { status: 500 });
	}
}
