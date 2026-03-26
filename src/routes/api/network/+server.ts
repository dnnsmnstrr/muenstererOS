import { json } from '@sveltejs/kit';
import { CURRENT_DOMAIN } from '$lib/config';
import networkSeeds from '../../../data/network_seeds.json';

interface Node {
	id: string;
	url: string;
	label: string;
	depth: number;
	type: 'root' | 'personal' | 'external';
}

interface Edge {
	source: string;
	target: string;
}

interface CacheEntry {
	links: string[];
	timestamp: number;
}

const MAX_DEPTH = 3; // 3 levels deep as requested
const MAX_NODES = 100; // Limit nodes to avoid timeouts
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
const linkCache = new Map<string, CacheEntry>();

const EXCLUDED_DOMAINS = [
	'github.com',
	'gitlab.com',
	'twitter.com',
	'instagram.com',
	'facebook.com',
	'linkedin.com',
	'youtube.com',
	'x.com',
	't.me',
	'signal.me',
	'signal.org',
	'telegram.org',
	'spotify.com',
	'apple.com',
	'amazon.com',
	'google.com',
	'reddit.com',
	'mastodon.social',
	'bsky.app',
	'threads.net',
	'kickstarter.com',
	'onuniverse.com',
	'googleapis.com',
	'gstatic.com',
	'getkirby.com',
	'paypal.com',
	'paddle.com',
	'vercel.com',
	'linear.app',
	'cursor.com',
	'wordpress.com',
	'squarespace.com',
	'supabase.com',
	'11ty.dev',
	'codepen.io',
	'nextjs.org',
	'blogroll.org',
	'schema.org'
];

function isPersonal(url: string): boolean {
	const personalPatterns = [
		'.com',
		'.net',
		'.org',
		'.dev',
		'.tech',
		// services
		'github.io',
		'vercel.app',
		'netlify.app',
		// countries
		'.de',
		'.at',
		'.ch',
		'.uk',
		'.ca',
		'.nl',
		// other
		'.me',
		'.io',
		'.bio',
		'.app',
		'.space'
	];
	try {
		const urlObj = new URL(url);
		const domain = urlObj.hostname;

		if (EXCLUDED_DOMAINS.some((social) => domain.endsWith(social))) {
			return false;
		}

		return personalPatterns.some((pattern) => domain.endsWith(pattern));
	} catch {
		return false;
	}
}

async function getLinks(url: string): Promise<string[]> {
	const cached = linkCache.get(url);
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.links;
	}

	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				Accept: 'text/html'
			},
			signal: AbortSignal.timeout(5000)
		});
		if (!response.ok) return [];
		let html = await response.text();

		// Ignore content in header and footer
		html = html.replace(/<(header|footer|nav)[^>]*>[\s\S]*?<\/\1>/gi, '');

		const urlRegex = /https?:\/\/[^\s"\\<>]+/g;
		const links = new Set<string>();
		let match;
		while ((match = urlRegex.exec(html)) !== null) {
			try {
				let foundUrl = match[0];
				if (foundUrl.endsWith('\\')) foundUrl = foundUrl.slice(0, -1);
				const linkUrl = new URL(foundUrl);

				if (!['http:', 'https:'].includes(linkUrl.protocol)) continue;

				const path = linkUrl.pathname.toLowerCase();
				const isRoot = path === '/' || path === '';
				const isDirectory =
					path.includes('/sites') ||
					path.includes('/people') ||
					path.includes('/links') ||
					path.includes('/blogroll');

				// Follow if it's a directory we're interested in, OR if it's a root link to a different domain (likely a personal site)
				if (isDirectory || (isRoot && getBaseDomain(foundUrl) !== getBaseDomain(url))) {
					links.add(foundUrl);
				}
			} catch {
				// Invalid URL
			}
		}

		// Also try standard href extraction for relative links
		const hrefRegex = /href=["']([^"']+)["']/g;
		while ((match = hrefRegex.exec(html)) !== null) {
			try {
				const resolvedUrl = new URL(match[1], url).toString();
				const linkUrl = new URL(resolvedUrl);

				if (!['http:', 'https:'].includes(linkUrl.protocol)) continue;

				const path = linkUrl.pathname.toLowerCase();
				const isRoot = path === '/' || path === '';
				const isDirectory =
					path.includes('/sites') ||
					path.includes('/people') ||
					path.includes('/links') ||
					path.includes('/blogroll');

				if (isDirectory || (isRoot && getBaseDomain(resolvedUrl) !== getBaseDomain(url))) {
					links.add(resolvedUrl);
				}
			} catch {
				// Invalid URL
			}
		}
		const result = Array.from(links);
		linkCache.set(url, { links: result, timestamp: Date.now() });
		return result;
	} catch (e) {
		console.error(`Failed to fetch links from ${url}:`, e);
		return [];
	}
}

function getBaseDomain(url: string): string {
	try {
		const urlObj = new URL(url);
		const parts = urlObj.hostname.split('.');

		// Handle specific second-level domains
		if (parts.length >= 2) {
			// Check for .co.uk and similar domains
			const secondLevelDomains = ['co.uk', 'gov.uk', 'ac.uk', 'org.uk'];
			const lastTwoParts = parts.slice(-2).join('.');

			// Determine if the last two parts or last three parts form a known second-level domain
			if (secondLevelDomains.includes(lastTwoParts)) {
				const base = parts.slice(-3).join('.');
				return `${urlObj.protocol}//${base}/`;
			} else {
				const base = parts.slice(-2).join('.');
				return `${urlObj.protocol}//${base}/`;
			}
		}
		return urlObj.origin + '/';
	} catch {
		return url;
	}
}

export async function GET({ url: requestUrl }) {
	const depthParam = requestUrl.searchParams.get('depth');
	const maxDepth = depthParam ? Math.min(Math.max(parseInt(depthParam, 10), 1), 10) : MAX_DEPTH;

	const rootUrl = getBaseDomain(`https://${CURRENT_DOMAIN}/`);
	const nodes: Node[] = [{ id: rootUrl, label: CURRENT_DOMAIN, depth: 0, type: 'root' }];
	const edges: Edge[] = [];
	const visited = new Set<string>([rootUrl]);
	const queue: { url: string; depth: number }[] = [];

	// Add seeds from the config file
	for (const seedUrl of networkSeeds) {
		const baseDomain = getBaseDomain(seedUrl);
		if (!visited.has(baseDomain)) {
			try {
				const urlObj = new URL(baseDomain);
				nodes.push({
					id: baseDomain,
					label: urlObj.hostname,
					url: seedUrl,
					depth: 1,
					type: 'personal'
				});
				edges.push({ source: rootUrl, target: baseDomain });
				visited.add(baseDomain);
				queue.push({ url: seedUrl, depth: 1 }); // Use the full URL for crawling
			} catch {
				// Invalid seed URL
			}
		}
	}

	let currentLevel = queue;
	let currentDepth = 1;

	while (currentLevel.length > 0 && currentDepth < maxDepth && nodes.length < MAX_NODES) {
		const results = await Promise.all(
			currentLevel.map(async ({ url, depth }) => {
				const discoveredLinks = await getLinks(url);
				return { url, depth, discoveredLinks };
			})
		);

		const nextLevel: { url: string; depth: number }[] = [];

		for (const { url, depth, discoveredLinks } of results) {
			// Limit links per page to avoid one seed exhausting the limit
			// and shuffle them to ensure diversity
			const shuffledLinks = discoveredLinks.sort(() => Math.random() - 0.5).slice(0, 25);

			for (const link of shuffledLinks) {
				if (nodes.length >= MAX_NODES) break;

				try {
					const linkUrl = new URL(link);
					const normalizedLink = getBaseDomain(link);

					if (EXCLUDED_DOMAINS.some((social) => linkUrl.hostname.endsWith(social))) {
						continue;
					}

					if (!visited.has(normalizedLink)) {
						const personal = isPersonal(normalizedLink);
						if (personal || depth < 1) {
							// Only go deep for personal sites or if we are at root
							nodes.push({
								id: normalizedLink,
								label: new URL(normalizedLink).hostname,
								url: link,
								depth: depth + 1,
								type: personal ? 'personal' : 'external'
							});
							visited.add(normalizedLink);
							nextLevel.push({ url: link, depth: depth + 1 });
						}
					}

					if (visited.has(normalizedLink) && normalizedLink !== getBaseDomain(url)) {
						// Add edge if not already present
						if (
							!edges.find(
								(e) =>
									(e.source === getBaseDomain(url) && e.target === normalizedLink) ||
									(e.source === normalizedLink && e.target === getBaseDomain(url))
							)
						) {
							edges.push({ source: getBaseDomain(url), target: normalizedLink });
						}
					}
				} catch {
					// Invalid URL
				}
			}
		}

		currentLevel = nextLevel;
		currentDepth++;
	}

	return json({ nodes, edges });
}
