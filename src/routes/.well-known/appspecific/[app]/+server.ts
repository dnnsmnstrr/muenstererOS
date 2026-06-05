import { json, type RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';
import crypto from 'crypto';

const TARGET_APP = 'com.chrome.devtools.json';

function uuidFromString(value: string): string {
	const hash = crypto.createHash('sha1').update(value).digest();
	hash[6] = (hash[6] & 0x0f) | 0x50; // version 5
	hash[8] = (hash[8] & 0x3f) | 0x80; // variant
	const hex = hash.toString('hex');
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export const GET: RequestHandler = async ({ params }) => {
	// Only allow this endpoint in development mode to avoid leaking absolute server paths
	if (!dev || params.app !== TARGET_APP) {
		return new Response(null, { status: 404 });
	}

	const root = process.cwd();
	const uuid = uuidFromString(root);

	return json({
		workspace: {
			root,
			uuid
		}
	});
};
