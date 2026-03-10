import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = ({ params }) => {
	throw redirect(302, `/admin?file=${params.file}`);
};