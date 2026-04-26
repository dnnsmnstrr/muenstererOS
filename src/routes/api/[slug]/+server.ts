import { json, error } from '@sveltejs/kit';
import { searchData, sortData } from '$lib/utils/api';
import type { DataItem } from '$lib/utils/api';
import playlists from '../../../data/playlists.json';
import changes from '../../../data/changes.json';
import pages from '../../../data/pages.json';
import uses from '../../../data/uses.json';
import { gists } from '$lib/config';

const dataMap: Record<string, any> = {
	playlists,
	changes,
	pages,
	uses
};
const DEFAULT_LIMIT = 50;

export async function GET({ params, url }) {
	const { slug } = params;

	if (!dataMap[slug] && (!gists || !gists[slug as keyof typeof gists])) {
		throw error(404, `No data found for ${slug}`);
	}

	if (!dataMap[slug]) {
		// fall back to gists
		const gistUrl = new URL(`/api/gists/${slug}${url.search}`, url.origin);
		const gistResponse = await fetch(gistUrl);

		if (!gistResponse.ok) {
			throw error(gistResponse.status, `No static data or gist found for slug: ${slug}`);
		}

		return gistResponse;
	}


	try {
		const data = dataMap[slug];

		// Pagination parameters
		const page = parseInt(url.searchParams.get('page') || '1', 10);
		const limit = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`, 10);

		// Search parameter
		const search = url.searchParams.get('search')?.toLowerCase();

		// Sorting parameters
		const sortKey = url.searchParams.get('sortBy');
		const sortDir = url.searchParams.get('direction')?.toLowerCase() === 'desc' ? 'desc' : 'asc';

		let filteredData = data;

		// Search filter
		if (search && Array.isArray(filteredData)) {
			filteredData = searchData(filteredData, search, ['title', 'description', 'year', 'date']);
		}
		// Sorting
		if (sortKey && Array.isArray(filteredData)) {
			// Only sort if the key exists on the first item (or fallback to string)
			const key = sortKey as keyof DataItem;
			if (filteredData.length > 0 && key in filteredData[0]) {
				filteredData = sortData(filteredData, key, sortDir);
			}
		}

		if (!Array.isArray(filteredData)) {
			// If the data is not an array, return as is (no pagination)
			return json(filteredData);
		}

		const start = (page - 1) * limit;
		const end = start + limit;
		const paginated = filteredData.slice(start, end);

		return json({
			page,
			limit,
			dataType: slug,
			total: filteredData.length,
			totalPages: Math.ceil(filteredData.length / limit),
			items: paginated
		});
	} catch (err: any) {
		throw error(404, `Data file not found for slug: ${slug}, Error: ${err.message}`);
	}
}
