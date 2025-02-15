import { redirect } from '@sveltejs/kit';
import { redirects } from '$lib/redirects';
import { getRedirect } from '$lib/utils/redirect';

export async function GET({ params }) {
  const foundRedirect = getRedirect(params.query, redirects)
  throw redirect(302, foundRedirect)
}