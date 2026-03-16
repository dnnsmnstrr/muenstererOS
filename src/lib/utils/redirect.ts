export type Redirect = {
	name: string;
	description?: string;
	url?: string;
	aliases?: string[];
};

type RedirectOptions = {
	log?: (...inputs: any) => void;
	returnObject?: boolean;
	noReturn?: boolean;
};
export function getRedirect(query: string, redirects: Redirect[], options?: RedirectOptions) {
	if (options && options.log) {
		options.log('query', query);
	}
	let redirect: Redirect = { name: '' };
	switch (query) {
		// special cases
		case 'random':
			redirect = redirects[Math.floor(Math.random() * redirects.length)];
			break;
		default:
			// search for redirect
			const foundRedirect = redirects.find(({ name = '', aliases = [] }) => {
				const lowerCaseQuery = query.toLowerCase();
				return (
					name.toLowerCase() === lowerCaseQuery ||
					aliases.some((alias) => alias.toLowerCase() === lowerCaseQuery)
				);
			});
			if (foundRedirect) {
				redirect = foundRedirect;
			}
	}

	return options?.returnObject ? redirect : getRedirectURL(redirect, { query, ...options });
}

export const getRedirectURL = (
	{ url, name }: Redirect,
	{ query, noReturn }: { query?: string } & RedirectOptions = {}
) => {
	let path = '';
	if (url) {
		path = `${url}${path}`;
	} else if (name) {
		path = `/${name}${path}`;
	} else {
		// a failed redirect will end up back here, therefore the 'noReturn' parameter is used to avoid endless loops on redirect attempts
		path = `/404/${!noReturn ? query : ''}`;
		console.log('path', path);
	}

	return path;
};
