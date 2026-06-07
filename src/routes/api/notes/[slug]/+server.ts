import { USERNAME_SHORT } from '$lib/config.js';
import { gistCache } from '$lib/server/cache';
import { json } from '@sveltejs/kit';

const CACHE_TTL = 60 * 60; // 1 hour

export async function GET({ params, fetch }) {
	const { slug } = params;
	const cacheKey = `note_${slug}`;

	const cachedData = gistCache.get(cacheKey);
	if (cachedData) {
		return json(cachedData);
	}

	try {
		const githubUrl = `https://github.com/${USERNAME_SHORT}/zettelkasten/tree/main/notes/${slug}.md`;
		const webUrl = `https://${USERNAME_SHORT}.github.io/zettelkasten/${slug}`;
		const response = await fetch(
			`https://raw.githubusercontent.com/${USERNAME_SHORT}/zettelkasten/main/notes/${slug}.md`
		);

		if (!response.ok) {
			if (response.status === 404) {
				return json({ error: 'Note not found' }, { status: 404 });
			}
			throw new Error('Failed to fetch note from GitHub');
		}

		const markdown = await response.text();
		const { frontmatter, content } = parseMarkdown(markdown);

		const noteData = {
			slug,
			title: frontmatter.title || slug,
			tags: frontmatter.tags || [],
			date: frontmatter.date || '',
			content,
			raw: markdown,
			githubUrl,
			webUrl
		};

		gistCache.set(cacheKey, noteData, CACHE_TTL);

		return json(noteData);
	} catch (err) {
		console.error('Note fetch error:', err);
		return json({ error: 'Failed to fetch note' }, { status: 500 });
	}
}

function parseMarkdown(markdown: string) {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
	const match = markdown.match(frontmatterRegex);

	if (!match) {
		return { frontmatter: {}, content: markdown };
	}

	const yaml = match[1];
	const content = markdown.replace(match[0], '');
	const frontmatter: Record<string, any> = {};

	yaml.split('\n').forEach((line) => {
		const [key, ...valueParts] = line.split(':');
		if (key && valueParts.length > 0) {
			const value = valueParts.join(':').trim();
			if (value.startsWith('[') && value.endsWith(']')) {
				frontmatter[key.trim()] = value
					.slice(1, -1)
					.split(',')
					.map((v) => v.trim());
			} else {
				frontmatter[key.trim()] = value;
			}
		}
	});

	return { frontmatter, content };
}
