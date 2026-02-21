import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/status');
	if (!res.ok) {
		throw new Error('Failed to fetch status');
	}
	const status = await res.json();
	return { status };
};
