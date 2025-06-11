import { json } from '@sveltejs/kit';
import { user } from '$lib/config';

export async function GET() {
    const age = Math.floor((Date.now() - new Date(user.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
	const data = {
		...user,
        location: 'Mainz, Germany',
        birthplace: 'Durham, North Carolina, USA',
		age,
        height: 176, // in cm
        languages: ['de-DE', 'en-US'],
        pronouns: 'he/him',
	};
	return json(data);
}
