import type { FAQItem } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/api/faq');

	if (response.ok) {
		const data = await response.json();
		// api endpoint returns pagination object if it's an array, or the raw data object
		// our new structure is { items: FAQItem[] }
		const faqData: FAQItem[] = data.items || [];
		return {
			faqData
		};
	}

	return {
		faqData: []
	};
};
