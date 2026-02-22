import { redirect } from '@sveltejs/kit';

export const load = async () => {
    // Set the language to German
    localStorage.setItem('language', 'de');

    // Redirect to home
    throw redirect(302, '/');
};