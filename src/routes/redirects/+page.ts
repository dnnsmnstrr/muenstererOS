import type { Redirect } from "$lib/redirect";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  const response = await fetch('/api/redirects');
	const redirects: Redirect[] = await response.json();

	return { redirects };
}