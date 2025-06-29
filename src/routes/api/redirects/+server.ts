import { redirects } from '$lib/redirects';
import { searchData } from '$lib/utils/api';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const type = url.searchParams.get('type');
	const search = url.searchParams.get('search')?.toLowerCase();

	let filtered = redirects;

	if (search) {
		filtered = searchData(redirects, search, ['name', 'description', 'aliases', 'url'])
	}

    if (type) {
        filtered = filtered.filter((redirect) => {
            if (type === 'internal' && 
                (!redirect.url || !redirect.url.startsWith('http')
            )) return true;
            if (type === 'external' && 
                (redirect.url?.startsWith('http')
            )) return true;
            return false;
        });
    }
	return json(filtered);
}
