import { gists } from '$lib/config';
import { json } from '@sveltejs/kit';
import buttons from '$lib/../data/buttons.json';
import changes from '$lib/../data/changes.json';
import llms from '$lib/../data/llms.json';
import network_seeds from '$lib/../data/network_seeds.json';
import pages from '$lib/../data/pages.json';
import playlists from '$lib/../data/playlists.json';
import projects from '$lib/../data/projects.json';
import uses from '$lib/../data/uses.json';

const staticData = {
	buttons,
	changes,
	llms,
	network_seeds,
	pages,
	playlists,
	projects,
	uses
};

export async function GET({ url, request }) {
	const includeStatic = url.searchParams.get('static') !== 'false';
	const includeGists = url.searchParams.get('gists') !== 'false';
	const token = request.headers.get('Authorization')?.replace('Bearer ', '') || url.searchParams.get('token');

	const exportData: any = {
		metadata: {
			exportedAt: new Date().toISOString(),
			origin: url.origin,
			options: {
				static: includeStatic,
				gists: includeGists
			}
		}
	};

	if (includeStatic) {
		exportData.staticData = staticData;
	}

	if (includeGists) {
		const gistResults: Record<string, any> = {};
		const gistEntries = Object.entries(gists);

		await Promise.all(
			gistEntries.map(async ([name, gist]) => {
				const gistApiUrl = `https://api.github.com/gists/${gist.id}`;
				const headers: Record<string, string> = {
					Accept: 'application/vnd.github.v3+json'
				};
				if (token) {
					headers['Authorization'] = `token ${token}`;
				}

				try {
					const response = await fetch(gistApiUrl, { headers });
					if (response.ok) {
						const apiData = await response.json();
						const fileContent = apiData.files[gist.filename]?.content;
						let content = fileContent;
						try {
							content = JSON.parse(fileContent);
						} catch (e) {
							// Keep as string if not JSON
						}

						gistResults[name] = {
							id: gist.id,
							name: gist.name,
							filename: gist.filename,
							content,
							updatedAt: apiData.updated_at,
							gistUrl: apiData.html_url,
							versionCount: apiData.history?.length || 0
						};
					} else {
						gistResults[name] = {
							id: gist.id,
							error: `Failed to fetch: ${response.status} ${response.statusText}`
						};
					}
				} catch (error) {
					gistResults[name] = {
						id: gist.id,
						error: error instanceof Error ? error.message : 'Unknown error'
					};
				}
			})
		);
		exportData.gists = gistResults;
	}

	return json(exportData);
}
