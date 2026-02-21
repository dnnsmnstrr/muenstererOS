import { json } from '@sveltejs/kit';
import pages from '../../../data/pages.json';
import { links } from '$lib/config';

export async function GET() {
	let cvStatus = 'unknown';
	try {
		const response = await fetch(links.cv, { method: 'HEAD' });
		cvStatus = response.ok ? 'online' : 'offline';
	} catch (e) {
		cvStatus = 'offline';
	}

	return json({
		lastDeployment: __BUILD_TIME__,
		commitCount: parseInt(__COMMIT_COUNT__, 10),
		pageCount: pages.length,
		cvStatus
	});
}
