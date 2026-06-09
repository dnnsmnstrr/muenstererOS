import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';

export const load = async () => {
	// Set the language to German
	if (browser) {
		localStorage.setItem('language', 'de');
	}

	// Redirect to home
	throw redirect(302, '/');
};
