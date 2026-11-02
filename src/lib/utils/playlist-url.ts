/**
 * Utilities for URL validation, Spotify ID extraction, and tracking parameter stripping
 * for playlist administration.
 */

const KNOWN_TRACKING_KEYS = new Set([
	'si',
	'pt',
	'nd',
	'utm_source',
	'utm_medium',
	'utm_campaign',
	'utm_term',
	'utm_content',
	'gclid',
	'fbclid',
	'msclkid',
	'ref',
	'referrer',
	'at',
	'ct',
	'ls',
	'uo',
	'app',
	'feature',
	'context',
	's',
	'igsh',
	't',
	'_hsenc',
	'_hsmi',
	'mc_cid',
	'mc_eid'
]);

/**
 * Strips tracking query parameters from a URL.
 */
export function stripTrackingParams(urlString: string): { cleanedUrl: string; wasStripped: boolean } {
	if (!urlString || typeof urlString !== 'string') {
		return { cleanedUrl: urlString || '', wasStripped: false };
	}

	const trimmed = urlString.trim();
	if (!trimmed) {
		return { cleanedUrl: '', wasStripped: false };
	}

	try {
		let urlToParse = trimmed;
		if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
			if (trimmed.includes('.')) {
				urlToParse = 'https://' + trimmed;
			} else {
				return { cleanedUrl: trimmed, wasStripped: false };
			}
		}

		const parsed = new URL(urlToParse);
		let wasStripped = false;

		// For open.spotify.com/playlist/... strip all search parameters
		if (parsed.hostname.includes('spotify.com')) {
			if (parsed.search) {
				parsed.search = '';
				wasStripped = true;
			}
		} else {
			const searchParams = new URLSearchParams(parsed.search);
			const keysToDelete: string[] = [];

			searchParams.forEach((_, key) => {
				const lowerKey = key.toLowerCase();
				if (KNOWN_TRACKING_KEYS.has(lowerKey) || lowerKey.startsWith('utm_')) {
					keysToDelete.push(key);
				}
			});

			if (keysToDelete.length > 0) {
				keysToDelete.forEach((key) => searchParams.delete(key));
				parsed.search = searchParams.toString() ? `?${searchParams.toString()}` : '';
				wasStripped = true;
			}
		}

		// Remove trailing question mark if present
		let resultUrl = parsed.toString();
		if (resultUrl.endsWith('?')) {
			resultUrl = resultUrl.slice(0, -1);
		}

		// If protocol was added, but original lacked protocol, keep protocol if cleaned
		return { cleanedUrl: resultUrl, wasStripped };
	} catch (e) {
		return { cleanedUrl: trimmed, wasStripped: false };
	}
}

/**
 * Extracts a Spotify playlist ID from a URL or URI if present.
 */
export function extractSpotifyId(input: string): { id: string; isUrlOrUri: boolean } {
	if (!input) return { id: '', isUrlOrUri: false };
	const trimmed = input.trim();

	// Match Spotify playlist URL e.g. https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...
	const urlMatch = trimmed.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
	if (urlMatch) {
		return { id: urlMatch[1], isUrlOrUri: true };
	}

	// Match Spotify URI e.g. spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
	const uriMatch = trimmed.match(/spotify:playlist:([a-zA-Z0-9]+)/);
	if (uriMatch) {
		return { id: uriMatch[1], isUrlOrUri: true };
	}

	return { id: trimmed, isUrlOrUri: false };
}

/**
 * Validates a URL string.
 */
export function validateUrl(input: string): { valid: boolean; error?: string } {
	if (!input || !input.trim()) return { valid: true };
	const trimmed = input.trim();

	if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
		return { valid: false, error: 'URL must start with http:// or https://' };
	}

	try {
		new URL(trimmed);
		return { valid: true };
	} catch (e) {
		return { valid: false, error: 'Invalid URL format' };
	}
}

/**
 * Smart import helper for pasting raw input into the Quick Paste field.
 */
export function parseQuickPlaylistInput(rawInput: string): {
	uri?: string;
	url?: string;
	gif?: string;
	imageUrl?: string;
	detectedType?: 'spotify' | 'applemusic' | 'gif' | 'image' | 'unknown';
	wasCleaned: boolean;
} {
	if (!rawInput || !rawInput.trim()) {
		return { wasCleaned: false };
	}

	const trimmed = rawInput.trim();
	const spotifyInfo = extractSpotifyId(trimmed);

	if (spotifyInfo.isUrlOrUri) {
		const { cleanedUrl, wasStripped } = stripTrackingParams(trimmed);
		return {
			uri: spotifyInfo.id,
			url: cleanedUrl.startsWith('http') ? cleanedUrl : undefined,
			detectedType: 'spotify',
			wasCleaned: wasStripped
		};
	}

	const { cleanedUrl, wasStripped } = stripTrackingParams(trimmed);

	if (cleanedUrl.includes('music.apple.com')) {
		return {
			url: cleanedUrl,
			detectedType: 'applemusic',
			wasCleaned: wasStripped
		};
	}

	if (cleanedUrl.includes('giphy.com') || cleanedUrl.endsWith('.gif')) {
		return {
			gif: cleanedUrl,
			detectedType: 'gif',
			wasCleaned: wasStripped
		};
	}

	if (/\.(png|jpg|jpeg|webp|svg)(\?.*)?$/i.test(cleanedUrl)) {
		return {
			imageUrl: cleanedUrl,
			detectedType: 'image',
			wasCleaned: wasStripped
		};
	}

	return {
		url: cleanedUrl.startsWith('http') ? cleanedUrl : undefined,
		detectedType: 'unknown',
		wasCleaned: wasStripped
	};
}
