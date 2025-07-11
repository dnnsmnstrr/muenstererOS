/**
 * GitHub Gist API utilities for admin interface
 */

export interface GistFile {
	content: string;
	truncated?: boolean;
	language?: string;
	raw_url?: string;
}

export interface GistData {
	id: string;
	description: string;
	public: boolean;
	html_url: string;
	created_at: string;
	updated_at: string;
	files: Record<string, GistFile>;
	history?: Array<{
		version: string;
		committed_at: string;
		change_status: {
			total: number;
			additions: number;
			deletions: number;
		};
	}>;
}

export interface GistUpdatePayload {
	description?: string;
	files: Record<string, {
		content?: string;
		filename?: string;
	}>;
}

export class GitHubGistAPI {
	private token: string;
	private baseUrl = 'https://api.github.com/gists';

	constructor(token: string) {
		this.token = token;
	}

	private get headers() {
		return {
			'Authorization': `token ${this.token}`,
			'Accept': 'application/vnd.github.v3+json',
			'Content-Type': 'application/json'
		};
	}

	/**
	 * Fetch a gist by ID
	 */
	async fetchGist(gistId: string): Promise<GistData> {
		const response = await fetch(`${this.baseUrl}/${gistId}`, {
			headers: this.headers
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`GitHub API error: ${response.status} ${response.statusText}\n${errorText}`);
		}

		return response.json();
	}


	/**
	 * Fetch gist history/revisions
	 */
	async fetchGistHistory(gistId: string): Promise<Array<{
		version: string;
		committed_at: string;
		change_status: {
			total: number;
			additions: number;
			deletions: number;
		};
	}>> {
		let page = 1;
		const perPage = 100;
		let allCommits: Array<{
			version: string;
			committed_at: string;
			change_status: {
				total: number;
				additions: number;
				deletions: number;
			};
		}> = [];

		while (true) {
			const response = await fetch(`${this.baseUrl}/${gistId}/commits?per_page=${perPage}&page=${page}`, {
				headers: this.headers
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`GitHub API error: ${response.status} ${response.statusText}\n${errorText}`);
			}

			const commits = await response.json();
			if (!Array.isArray(commits) || commits.length === 0) break;

			allCommits = allCommits.concat(commits);
			if (commits.length < perPage) break;
			page++;
		}

		return allCommits;
	}

	/**
	 * Update a gist
	 */
	async updateGist(gistId: string, payload: GistUpdatePayload): Promise<GistData> {
		const response = await fetch(`${this.baseUrl}/${gistId}`, {
			method: 'PATCH',
			headers: this.headers,
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`GitHub API error: ${response.status} ${response.statusText}\n${errorText}`);
		}

		return response.json();
	}

	/**
	 * List user's gists
	 */
	async listGists(perPage = 30, page = 1): Promise<GistData[]> {
		const response = await fetch(`${this.baseUrl}?per_page=${perPage}&page=${page}`, {
			headers: this.headers
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`GitHub API error: ${response.status} ${response.statusText}\n${errorText}`);
		}

		return response.json();
	}

	/**
	 * Create a new gist
	 */
	async createGist(description: string, files: Record<string, { content: string }>, isPublic = false): Promise<GistData> {
		const payload = {
			description,
			public: isPublic,
			files
		};

		const response = await fetch(this.baseUrl, {
			method: 'POST',
			headers: this.headers,
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`GitHub API error: ${response.status} ${response.statusText}\n${errorText}`);
		}

		return response.json();
	}

	/**
	 * Validate JSON content
	 */
	static validateJSON(content: string): { valid: boolean; error?: string; formatted?: string } {
		try {
			const parsed = JSON.parse(content);
			const formatted = JSON.stringify(parsed, null, 2);
			return { valid: true, formatted };
		} catch (error) {
			return {
				valid: false,
				error: error instanceof Error ? error.message : 'Invalid JSON'
			};
		}
	}

	/**
	 * Check if token has required scopes (this is a best-effort check)
	 */
	async validateToken(): Promise<{ valid: boolean; scopes?: string[]; error?: string }> {
		try {
			const response = await fetch('https://api.github.com/user', {
				headers: {
					'Authorization': `token ${this.token}`,
					'Accept': 'application/vnd.github.v3+json'
				}
			});

			if (!response.ok) {
				return {
					valid: false,
					error: `Token validation failed: ${response.status} ${response.statusText}`
				};
			}

			const scopes = response.headers.get('X-OAuth-Scopes')?.split(', ') || [];
			const hasGistScope = scopes.includes('gist') || scopes.includes('repo');

			return {
				valid: hasGistScope,
				scopes,
				error: hasGistScope ? undefined : 'Token missing required "gist" scope'
			};
		} catch (error) {
			return {
				valid: false,
				error: error instanceof Error ? error.message : 'Token validation failed'
			};
		}
	}
}

/**
 * Get a configured GitHub API instance from localStorage token
 */
export function getGitHubAPI(): GitHubGistAPI | null {
	if (typeof window === 'undefined') return null;
	
	const token = localStorage.getItem('github_admin_token');
	if (!token) return null;
	
	return new GitHubGistAPI(token);
}
