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
        const versions = apiData.history.map((item) => ({
            version: item.version,
            url: item.url,
            timestamp: item.committed_at,
        }));
        // console.log(versions)
        return json({ ...gistData, updatedAt, gistUrl: apiData.html_url, versions });
    } catch (error) {
        return json({ error }, { status: 500 });
    }
}