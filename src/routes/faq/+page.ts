import type { FAQItem } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/api/faq');

	if (response.ok) {
		const data = await response.json();
		// api endpoint returns pagination object if it's an array
		const faqData: FAQItem[] = data.items || (Array.isArray(data) ? data : []);
		return {
			faqData
		};
	}

	return {
		faqData: []
	};
};
