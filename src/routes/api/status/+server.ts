import { json } from '@sveltejs/kit';
import pages from '../../../data/pages.json';
import { links } from '$lib/config';
import { GOATCOUNTER_API_KEY } from '$env/static/private';

export async function GET() {
	let cvStatus = 'unknown';
	try {
		const response = await fetch(links.cv, { method: 'HEAD' });
		cvStatus = response.ok ? 'online' : 'offline';
	} catch (e) {
		cvStatus = 'offline';
	}

	let monthlyViews = 0;
	if (GOATCOUNTER_API_KEY) {
		try {
			const now = new Date();
			const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
			const goatResponse = await fetch(
				`https://dnnsmnstrr.goatcounter.com/api/v0/stats/total?start=${startOfMonth}`,
				{
					headers: {
						Authorization: `Bearer ${GOATCOUNTER_API_KEY}`
					}
				}
			);
			if (goatResponse.ok) {
				const data = await goatResponse.json();
				monthlyViews = data.total || 0;
			}
		} catch (e) {
			console.error('Failed to fetch GoatCounter stats:', e);
		}
	}

	return json({
		lastDeployment: __BUILD_TIME__,
		commitCount: parseInt(__COMMIT_COUNT__, 10),
		pageCount: pages.length,
		cvStatus,
		monthlyViews
	});
}
