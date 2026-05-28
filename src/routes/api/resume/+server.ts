import { RESUME_GIST_ID } from '$lib/config';
import { json } from '@sveltejs/kit';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

export async function GET({ url }) {
	const gistApiUrl = `https://api.github.com/gists/${RESUME_GIST_ID}`;
	const includeVersions = url.searchParams.get('versions') === 'true';

	try {
		const response = await fetch(gistApiUrl);

		if (!response.ok) {
			return json({ error: 'Failed to fetch resume data' }, { status: response.status, headers: corsHeaders });
		}

		const apiData = await response.json();
		const gistData = JSON.parse(apiData.files['resume.json'].content);
		const updatedAt = apiData.updated_at;

		let result = { ...gistData, updatedAt, gistUrl: apiData.html_url };

		if (includeVersions) {
			const versions = apiData.history.map(
				(item: { version: string; url: string; committed_at: string }) => ({
					version: item.version,
					url: item.url,
					timestamp: item.committed_at
				})
			);
			result = { ...result, versions };
		}

		return json(result, { headers: corsHeaders });
	} catch (error) {
		console.error('Resume fetch error:', error);
		return json({ error: 'Failed to fetch resume data' }, { status: 500, headers: corsHeaders });
	}
}

export async function OPTIONS() {
	return new Response(null, {
		headers: corsHeaders
	});
}
