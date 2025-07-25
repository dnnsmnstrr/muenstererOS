import { gists } from '$lib/config';
import { json } from '@sveltejs/kit';

export async function GET() {
    const gistApiUrl = `https://api.github.com/gists/${gists.events.id}`;

    try {
        const response = await fetch(gistApiUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch data from GitHub');
        }

        const apiData = await response.json();
        const gistData = JSON.parse(apiData.files[gists.events.filename].content);
        const updatedAt = apiData.updated_at;
        const versions = apiData.history.map((item: any) => ({
            ...item,
            timestamp: item.committed_at,
            changes: item.change_status?.total,
        }));

        return json({ ...gistData, updatedAt, gistUrl: apiData.html_url, versions });
    } catch (error) {
        return json({ error }, { status: 500 });
    }
}