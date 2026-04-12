import { i18n } from '$lib/i18n/i18n.svelte';

export type DataItem = {
	title?: string;
	description?: string;
	date?: string;
	type?: string;
};

type SortDirection = 'asc' | 'desc';

export function sortData(items: DataItem[], key: keyof DataItem, direction: SortDirection = 'asc') {
	const filteredItems = items.slice().sort((a, b) => {
		const aValue = a[key];
		const bValue = b[key];

		if (aValue === undefined) return 1;
		if (bValue === undefined) return -1;

		if (
			key === 'date' &&
			typeof aValue === 'string' &&
			typeof bValue === 'string' &&
			!isNaN(Date.parse(aValue)) &&
			!isNaN(Date.parse(bValue))
		) {
			const aDate = new Date(aValue);
			const bDate = new Date(bValue);
			if (direction === 'asc') return aDate.getTime() - bDate.getTime();
			else return bDate.getTime() - aDate.getTime();
		}

		if (typeof aValue === 'string' && typeof bValue === 'string') {
			/* Optimized string sorting: Uses localeCompare with the active language (i18n.lang) for better i18n support */
			if (direction === 'asc') return aValue.localeCompare(bValue, i18n.lang);
			else return bValue.localeCompare(aValue, i18n.lang);
		}

		if (typeof aValue === 'number' && typeof bValue === 'number') {
			if (direction === 'asc') return aValue - bValue;
			else return bValue - aValue;
		}

		// fallback to string comparison
		/* Optimized string sorting: Uses localeCompare with the active language (i18n.lang) for better i18n support */
		if (direction === 'asc') return String(aValue).localeCompare(String(bValue), i18n.lang);
		else return String(bValue).localeCompare(String(aValue), i18n.lang);
	});
	return filteredItems;
}

export function searchData<T extends Record<string, any> = DataItem>(
	items: T[],
	query: string,
	searchKeys: (keyof T)[] = ['title', 'description'] as (keyof T)[]
) {
	const lowerQuery = String(query).toLowerCase();
	const searchedItems = items.filter((item) =>
		searchKeys.some((key) => {
			if (!item[key]) return false;
			const value = item[key];
			if (Array.isArray(value)) {
				return (value as Array<string | number | boolean>).some((v: string | number | boolean) =>
					String(v).toLowerCase().includes(lowerQuery)
				);
			}
			return value && String(value).toLowerCase().includes(lowerQuery);
		})
	);
	return searchedItems;
}
