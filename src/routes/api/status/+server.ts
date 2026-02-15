import { json } from '@sveltejs/kit';
import pages from '../../../data/pages.json';

export async function GET() {
	return json({
		lastDeployment: __BUILD_TIME__,
		commitCount: parseInt(__COMMIT_COUNT__, 10),
		pageCount: pages.length
	});
}
