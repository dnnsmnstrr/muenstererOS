import { CURRENT_DOMAIN } from '$lib/config';
import xml2js from 'xml2js';

export async function load({
	fetch
}: {
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}) {
	const sitemapUrl = `/static/sitemap.xml`;
	const response = await fetch(sitemapUrl);
	const xml = await response.text();
	const result = await xml2js.parseStringPromise(xml);
	const urls = result.urlset.url.map((url: { loc: string[] }) => ({
		href: url.loc[0].replace(`https://${CURRENT_DOMAIN}`, ''),
		lastModified: url.lastmod[0],
        title: url.loc[0].split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
	}));
	const sortedUrls = urls.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).reverse();

	return {
		urls: sortedUrls
	};
}
