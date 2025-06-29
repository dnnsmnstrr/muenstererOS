type DataItem = {
	title?: string;
	description?: string;
	date?: string;
	type?: string;
};

type SortDirection = 'asc' | 'desc';

function sortData(items: DataItem[], key: keyof DataItem, direction: SortDirection = 'asc') {
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

function searchData(
	items: DataItem[],
	query: string,
	searchKeys: (keyof DataItem)[] = ['title', 'description']
) {
	const searchedItems = items.filter((item) =>
		searchKeys.some((key) => item && item[key] && String(item[key]).toLowerCase().includes(query))
	);
	return searchedItems;
}
