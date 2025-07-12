import { json } from '@sveltejs/kit';
import { user } from '$lib/config';

export async function GET() {
    const age = Math.floor((Date.now() - new Date(user.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
	const data = {
		...user,
        url: user.website,
        additionalName: 'Horst-Alfred',
        location: 'Mainz, Germany',
        birthPlace: 'Durham, North Carolina, USA',
        gender: 'male',
        pronouns: 'he/him',
		age,
        height: 176, // in cm
        languages: ['de-DE', 'en-US'],
        jobTitle: user.occupation,
	}; // https://schema.org/Person
	return json(data);
}
