import { CURRENT_DOMAIN } from '$lib/config';
// @ts-expect-error - xml2js has no type definitions
import xml2js from 'xml2js';

export async function load({
	fetch
}: {
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}) {
	const sitemapUrl = `/sitemap.xml`;
	const response = await fetch(sitemapUrl);
	const xml = await response.text();
	const result = await xml2js.parseStringPromise(xml);
	// Parse the sitemap XML and extract URLs, adding a slug for dynamic localization.
	const urls = result.urlset.url.map(
		(url: {
			loc: string[];
			lastmod: string[];
		}): { href: string; slug: string; lastModified: string; title: string } => {
			const href = url.loc[0].replace(`https://${CURRENT_DOMAIN}`, '');
			const slug = href === '/' ? 'home' : href.split('/').pop() || 'home';
			return {
				href,
				slug,
				lastModified: url.lastmod[0],
				title: slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
			};
		}
	);
	const sortedUrls = (urls as { href: string; slug: string; lastModified: string; title: string }[])
		.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
		.reverse();

	return {
		urls: sortedUrls
	};
}
