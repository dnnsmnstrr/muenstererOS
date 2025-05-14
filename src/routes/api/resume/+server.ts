import { RESUME_GIST_ID } from '$lib/config';

export async function GET({ url }) {
    const gistApiUrl = `https://api.github.com/gists/${RESUME_GIST_ID}`;
    const includeVersions = url.searchParams.get('versions') === 'true';

    try {
        const response = await fetch(gistApiUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch data from GitHub');
        }

        const apiData = await response.json();
        const gistData = JSON.parse(apiData.files['resume.json'].content);
        const updatedAt = apiData.updated_at;

        let result = { ...gistData, updatedAt, gistUrl: apiData.html_url };

        if (includeVersions) {
            const versions = apiData.history.map((item) => ({
                version: item.version,
                url: item.url,
                timestamp: item.committed_at,
            }));
            result = { ...result, versions };
        }

        return new Response(JSON.stringify(result), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Allow all origins
                'Access-Control-Allow-Methods': 'GET, OPTIONS', // Allowed methods
                'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Allow all origins
            }
        });
    }
}

export async function OPTIONS() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*', // Allow all origins
            'Access-Control-Allow-Methods': 'GET, OPTIONS', // Allowed methods
            'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
        }
    });
}