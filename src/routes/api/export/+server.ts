import { gists, USERNAME_SHORT } from '$lib/config';
import { json } from '@sveltejs/kit';
import buttons from '$lib/../data/buttons.json';
import changes from '$lib/../data/changes.json';
import llms from '$lib/../data/llms.json';
import network_seeds from '$lib/../data/network_seeds.json';
import pages from '$lib/../data/pages.json';

const staticData = {
	buttons,
	changes,
	llms,
	network_seeds,
	pages
};

export async function GET({ url, request, fetch }) {
	const includeStatic = url.searchParams.get('static') !== 'false';
	const includeGists = url.searchParams.get('gists') !== 'false';
	const authHeader = request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '').replace('token ', '');

	if (includeGists) {
		if (!authHeader) {
			return json({ error: 'Unauthorized: Gist export requires admin token' }, { status: 401 });
		}

		try {
			const userRes = await fetch('https://api.github.com/user', {
				headers: { Authorization: authHeader }
			});
			const userData = await userRes.json();
			if (!userRes.ok || userData.login !== USERNAME_SHORT) {
				return json({ error: 'Forbidden: Admin access required' }, { status: 403 });
			}
		} catch (err) {
			return json({ error: 'Authentication failed' }, { status: 500 });
		}
	}

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
					Accept: 'application/vnd.github.v3+json',
					Authorization: `token ${token}`
				};

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
