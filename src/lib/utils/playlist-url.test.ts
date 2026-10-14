import { describe, it, expect } from 'vitest';
import {
	stripTrackingParams,
	extractSpotifyId,
	validateUrl,
	parseQuickPlaylistInput
} from './playlist-url';

describe('stripTrackingParams', () => {
	it('strips tracking params from Spotify playlist URLs', () => {
		const input = 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=1234567890abcdef';
		const result = stripTrackingParams(input);
		expect(result.cleanedUrl).toBe('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M');
		expect(result.wasStripped).toBe(true);
	});

	it('strips tracking params from Apple Music URLs', () => {
		const input = 'https://music.apple.com/de/playlist/tides/pl.u-76oNNr6uxpqbb6?ls=1&app=music&utm_source=twitter';
		const result = stripTrackingParams(input);
		expect(result.cleanedUrl).toBe('https://music.apple.com/de/playlist/tides/pl.u-76oNNr6uxpqbb6');
		expect(result.wasStripped).toBe(true);
	});

	it('leaves clean URLs unchanged', () => {
		const input = 'https://music.apple.com/de/playlist/tides/pl.u-76oNNr6uxpqbb6';
		const result = stripTrackingParams(input);
		expect(result.cleanedUrl).toBe(input);
		expect(result.wasStripped).toBe(false);
	});

	it('handles empty or non-string inputs gracefully', () => {
		expect(stripTrackingParams('')).toEqual({ cleanedUrl: '', wasStripped: false });
	});
});

describe('extractSpotifyId', () => {
	it('extracts ID from full Spotify web URL', () => {
		const input = 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abcd';
		const res = extractSpotifyId(input);
		expect(res.id).toBe('37i9dQZF1DXcBWIGoYBM5M');
		expect(res.isUrlOrUri).toBe(true);
	});

	it('extracts ID from Spotify URI', () => {
		const input = 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M';
		const res = extractSpotifyId(input);
		expect(res.id).toBe('37i9dQZF1DXcBWIGoYBM5M');
		expect(res.isUrlOrUri).toBe(true);
	});

	it('returns raw ID if string is already an ID', () => {
		const input = '37i9dQZF1DXcBWIGoYBM5M';
		const res = extractSpotifyId(input);
		expect(res.id).toBe('37i9dQZF1DXcBWIGoYBM5M');
		expect(res.isUrlOrUri).toBe(false);
	});
});

describe('validateUrl', () => {
	it('validates correct http and https URLs', () => {
		expect(validateUrl('https://example.com/playlist')).toEqual({ valid: true });
		expect(validateUrl('http://example.com')).toEqual({ valid: true });
	});

	it('returns valid for empty optional fields', () => {
		expect(validateUrl('')).toEqual({ valid: true });
		expect(validateUrl('   ')).toEqual({ valid: true });
	});

	it('returns invalid for URLs lacking http/https protocol', () => {
		const res = validateUrl('www.example.com');
		expect(res.valid).toBe(false);
		expect(res.error).toBe('URL must start with http:// or https://');
	});

	it('returns invalid for malformed URLs', () => {
		const res = validateUrl('https://');
		expect(res.valid).toBe(false);
	});
});

describe('parseQuickPlaylistInput', () => {
	it('parses Spotify share link', () => {
		const res = parseQuickPlaylistInput('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=999');
		expect(res.uri).toBe('37i9dQZF1DXcBWIGoYBM5M');
		expect(res.url).toBe('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M');
		expect(res.detectedType).toBe('spotify');
		expect(res.wasCleaned).toBe(true);
	});

	it('parses Apple Music share link', () => {
		const res = parseQuickPlaylistInput('https://music.apple.com/de/playlist/hold-on/pl.u-JPAZZlNsEpl11o?ls=1');
		expect(res.url).toBe('https://music.apple.com/de/playlist/hold-on/pl.u-JPAZZlNsEpl11o');
		expect(res.detectedType).toBe('applemusic');
		expect(res.wasCleaned).toBe(true);
	});

	it('parses Giphy GIF link', () => {
		const res = parseQuickPlaylistInput('https://media1.giphy.com/media/l0ExpMzowNRkPNnvW/giphy.gif?utm_source=test');
		expect(res.gif).toBe('https://media1.giphy.com/media/l0ExpMzowNRkPNnvW/giphy.gif');
		expect(res.detectedType).toBe('gif');
		expect(res.wasCleaned).toBe(true);
	});
});
