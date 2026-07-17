import { USERNAME_SHORT } from '$lib/config';
import { gistCache } from '$lib/server/cache';
import { json } from '@sveltejs/kit';

type NoteListItem = { name: string };
type Backlink = { slug: string; title: string };

const CACHE_KEY = 'notes_backlinks_index';
const CACHE_TTL = 60 * 60;
const MAX_CONCURRENT_REQUESTS = 8;
let buildingIndex: Promise<Record<string, Backlink[]>> | null = null;

export async function GET({ params, fetch }) {
	let index = gistCache.get<Record<string, Backlink[]>>(CACHE_KEY);

	if (!index) {
		try {
			buildingIndex ||= buildBacklinkIndex(fetch);
			index = await buildingIndex;
			gistCache.set(CACHE_KEY, index, CACHE_TTL);
		} catch (error) {
			console.error('Backlink index error:', error);
			return json({ error: 'Failed to build backlink index' }, { status: 500 });
		} finally {
			buildingIndex = null;
		}
	}

	return json(index[params.slug] || [], {
		headers: { 'cache-control': `public, max-age=0, s-maxage=${CACHE_TTL}` }
	});
}

async function buildBacklinkIndex(fetch: typeof globalThis.fetch) {
	const notes = await getNotes(fetch);
	const index: Record<string, Backlink[]> = {};
	let cursor = 0;

	async function processNextNote() {
		while (cursor < notes.length) {
			const item = notes[cursor++];
			const response = await fetch(
				`https://raw.githubusercontent.com/${USERNAME_SHORT}/zettelkasten/main/notes/${encodeURIComponent(item.name)}.md`
			);
			if (!response.ok) continue;

			const markdown = await response.text();
			const title = extractTitle(markdown) || item.name;
			for (const target of extractTargets(markdown)) {
				if (target === item.name) continue;
				(index[target] ||= []).push({ slug: item.name, title });
			}
		}
	}

	await Promise.all(
		Array.from({ length: Math.min(MAX_CONCURRENT_REQUESTS, notes.length) }, processNextNote)
	);
	for (const backlinks of Object.values(index)) {
		backlinks.sort((a, b) => a.title.localeCompare(b.title));
	}
	return index;
}

async function getNotes(fetch: typeof globalThis.fetch): Promise<NoteListItem[]> {
	const cachedNotes = gistCache.get<NoteListItem[]>('notes_list');
	if (cachedNotes) return cachedNotes;

	const response = await fetch(
		`https://api.github.com/repos/${USERNAME_SHORT}/zettelkasten/contents/notes`
	);
	if (!response.ok) throw new Error('Failed to fetch notes from GitHub');

	const files: { name: string }[] = await response.json();
	return files
		.filter((file) => file.name.endsWith('.md'))
		.map((file) => ({ name: file.name.slice(0, -3) }));
}

function extractTitle(markdown: string) {
	const match = markdown.match(/^---\s*\n[\s\S]*?^title:\s*(.+)$/m);
	return match?.[1].trim().replace(/^(['"])(.*)\1$/, '$2');
}

function extractTargets(markdown: string) {
	const targets = new Set<string>();

	for (const match of markdown.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
		targets.add(match[1].split('#', 1)[0].trim().replace(/\s+/g, '-'));
	}

	for (const match of markdown.matchAll(/\[[^\]]+\]\((\/notes\/[^\s)]+)\)/g)) {
		const target = match[1].slice('/notes/'.length).split(/[?#]/, 1)[0];
		try {
			targets.add(decodeURIComponent(target));
		} catch {
			targets.add(target);
		}
	}

	return targets;
}
