import { gists } from '$lib/config';
import { json } from '@sveltejs/kit';

export async function GET() {
	try {
		return json(gists);
	} catch (err) {
		console.error('List gists error:', err);
		return json({ error: 'Failed to list gists' }, { status: 500 });
	}
}
