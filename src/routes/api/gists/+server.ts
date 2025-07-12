import { gists } from '$lib/config';
import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        return json(gists);
    } catch (error) {
        return json({ error }, { status: 500 });
    }
}