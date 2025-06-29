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
			if (direction === 'asc') return aValue.localeCompare(bValue);
			else return bValue.localeCompare(aValue);
		}

		if (typeof aValue === 'number' && typeof bValue === 'number') {
			if (direction === 'asc') return aValue - bValue;
			else return bValue - aValue;
		}

		// fallback to string comparison
		if (direction === 'asc') return String(aValue).localeCompare(String(bValue));
		else return String(bValue).localeCompare(String(aValue));
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
            if (!item[key]) return false
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
