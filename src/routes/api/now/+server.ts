import { NOW_GIST_ID } from '$lib/config';
import { json } from '@sveltejs/kit';

export async function GET() {
	const gistApiUrl = `https://api.github.com/gists/${NOW_GIST_ID}`;

	try {
		const response = await fetch(gistApiUrl);

		if (!response.ok) {
			throw new Error('Failed to fetch data from GitHub');
		}

		const apiData = await response.json();
		// console.log(apiData)
		const gistData = JSON.parse(apiData.files['now.json'].content);
		const updatedAt = apiData.updated_at;
		const versions = apiData.history.map((item: any) => ({
			...item,
			timestamp: item.committed_at,
			changes: item.change_status?.total
		}));
		// console.log(versions)
		return json({ ...gistData, updatedAt, gistUrl: apiData.html_url, versions });
	} catch (err) {
		console.error('Now data fetch error:', err);
		return json({ error: 'Failed to fetch now data' }, { status: 500 });
	}
}
