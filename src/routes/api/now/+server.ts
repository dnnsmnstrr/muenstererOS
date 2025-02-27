import { USERNAME_SHORT } from '$lib/config';
import { json } from '@sveltejs/kit';

export async function GET() {
    const gistId = 'f18bfa6e4f02dc480426d05cf7adff79';
    const gistUrl = `https://gist.githubusercontent.com/${USERNAME_SHORT}/${gistId}/raw/now.json`; // Replace 'username' with your GitHub username

    try {
        const response = await fetch(gistUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch the JSON file from the GitHub Gist');
        }

        const data = await response.json();
        return json(data);
    } catch (error) {
        return json({ error }, { status: 500 });
    }
}