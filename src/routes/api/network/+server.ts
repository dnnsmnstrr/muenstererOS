import { redirects } from '$lib/redirects';
import { json } from '@sveltejs/kit';
import { CURRENT_DOMAIN } from '$lib/config';
import networkSeeds from '../../../data/network_seeds.json';

interface Node {
	id: string;
	label: string;
	depth: number;
	type: 'root' | 'personal' | 'external';
}

interface Edge {
	source: string;
	target: string;
}

const MAX_DEPTH = 3; // 3 levels deep as requested
const MAX_NODES = 30; // Limit nodes to avoid timeouts

function isPersonal(url: string): boolean {
	const personalPatterns = [
		'github.io',
		'vercel.app',
		'netlify.app',
		'pages.dev',
		'muensterer.tech',
		'felixmuensterer.com',
		'linus3d.de',
		'.me',
		'.tech'
	];
	try {
		const domain = new URL(url).hostname;
		return personalPatterns.some((pattern) => domain.endsWith(pattern));
	} catch {
		return false;
	}
}

async function getLinks(url: string): Promise<string[]> {
	try {
		const response = await fetch(url, {
			headers: { 'User-Agent': 'muenstererOS-NetworkCrawler/1.0' },
			signal: AbortSignal.timeout(3000)
		});
		if (!response.ok) return [];
		const html = await response.text();
		const linkRegex = /href=["'](https?:\/\/[^"']+)["']/g;
		const links = new Set<string>();
		let match;
		while ((match = linkRegex.exec(html)) !== null) {
			links.add(match[1]);
		}
		return Array.from(links);
	} catch (e) {
		console.error(`Failed to fetch links from ${url}:`, e);
		return [];
	}
}

export async function GET() {
	const rootUrl = `https://${CURRENT_DOMAIN}/`;
	const nodes: Node[] = [{ id: rootUrl, label: CURRENT_DOMAIN, depth: 0, type: 'root' }];
	const edges: Edge[] = [];
	const visited = new Set<string>([rootUrl]);
	const queue: { url: string; depth: number }[] = [{ url: rootUrl, depth: 0 }];

	// Add seeds from the config file
	for (const seedUrl of networkSeeds) {
		if (!visited.has(seedUrl)) {
			try {
				const urlObj = new URL(seedUrl);
				nodes.push({
					id: seedUrl,
					label: urlObj.hostname,
					depth: 1,
					type: 'personal'
				});
				edges.push({ source: rootUrl, target: seedUrl });
				visited.add(seedUrl);
				queue.push({ url: seedUrl, depth: 1 });
			} catch {
				// Invalid seed URL
			}
		}
	}

	// Add some seeds from redirects
	const redirectsSeeds = redirects
		.filter((r) => r.url && r.url.startsWith('http') && isPersonal(r.url))
		.slice(0, 5);

	for (const seed of redirectsSeeds) {
		if (seed.url && !visited.has(seed.url)) {
			nodes.push({
				id: seed.url,
				label: seed.name,
				depth: 1,
				type: 'personal'
			});
			edges.push({ source: rootUrl, target: seed.url });
			visited.add(seed.url);
			queue.push({ url: seed.url, depth: 1 });
		}
	}

	let head = 0;
	while (head < queue.length && nodes.length < MAX_NODES) {
		const { url, depth } = queue[head++];
		if (depth >= MAX_DEPTH) continue;

		// Limit the number of concurrent requests if needed, but for now
		// let's at least process a batch of nodes from the same depth together
		// to improve performance. For simplicity, we keep the sequential logic
		// but reduce MAX_NODES if it takes too long.
		const discoveredLinks = await getLinks(url);
		for (const link of discoveredLinks) {
			if (nodes.length >= MAX_NODES) break;

			try {
				const linkUrl = new URL(link);
				const normalizedLink = linkUrl.origin + linkUrl.pathname;

				if (!visited.has(normalizedLink)) {
					const personal = isPersonal(normalizedLink);
					if (personal || depth < 1) { // Only go deep for personal sites or if we are at root
						nodes.push({
							id: normalizedLink,
							label: linkUrl.hostname,
							depth: depth + 1,
							type: personal ? 'personal' : 'external'
						});
						visited.add(normalizedLink);
						queue.push({ url: normalizedLink, depth: depth + 1 });
					}
				}

				if (visited.has(normalizedLink) && normalizedLink !== url) {
					// Add edge if not already present
					if (!edges.find(e => (e.source === url && e.target === normalizedLink) || (e.source === normalizedLink && e.target === url))) {
						edges.push({ source: url, target: normalizedLink });
					}
				}
			} catch {
				// Invalid URL
			}
		}
	}

	return json({ nodes, edges });
}
