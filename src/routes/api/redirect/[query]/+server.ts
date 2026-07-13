import { redirect } from '@sveltejs/kit';
import { redirects } from '$lib/redirects';
import { getRedirect } from '$lib/utils/redirect';
import { GOATCOUNTER_API_KEY } from '$env/static/private';

export async function GET({ params, request }) {
	const redirectObj = getRedirect(params.query, redirects, { returnObject: true });
	const foundRedirect = getRedirect(params.query, redirects);

	if (foundRedirect && !foundRedirect.toString().includes('404')) {
		const name = (typeof redirectObj === 'object' && redirectObj?.name) ? redirectObj.name : params.query;
		if (GOATCOUNTER_API_KEY) {
			try {
				await fetch('https://dnnsmnstrr.goatcounter.com/api/v0/count', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${GOATCOUNTER_API_KEY}`
					},
					body: JSON.stringify({
						no_sessions: true,
						hits: [
							{
								path: `redirect-${name.toLowerCase()}`,
								title: `Redirect: ${name}`,
								event: true,
								user_agent: request.headers.get('user-agent') || undefined,
								ref: request.headers.get('referer') || undefined
							}
						]
					})
				});
			} catch (e) {
				console.error('Failed to track backend redirect to GoatCounter:', e);
			}
		}
	}

	throw redirect(302, String(foundRedirect));
}
