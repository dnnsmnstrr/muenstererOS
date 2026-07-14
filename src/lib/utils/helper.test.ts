import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/i18n/i18n.svelte', () => ({
	i18n: {
		lang: 'en',
		t: (key: string) =>
			({
				'duration.y': 'y',
				'duration.mo': 'mo',
				'duration.w': 'w',
				'duration.d': 'd',
				'duration.h': 'h',
				'duration.m': 'm',
				'duration.s': 's'
			})[key] ?? key
	}
}));

import { capitalize, disemvowel, formatDuration, hexToHsl, randomNumber } from './helper';

describe('helper utilities', () => {
	it('capitalizes text and handles an empty string', () => {
		expect(capitalize('hello')).toBe('Hello');
		expect(capitalize('')).toBe('');
	});

	it('removes vowels case-insensitively', () => {
		expect(disemvowel('Muensterer')).toBe('Mnstrr');
	});

	it('keeps random numbers inside the inclusive range', () => {
		vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(1);

		expect(randomNumber(5, 10)).toBe(5);
		expect(randomNumber(5, 10)).toBe(10);
	});

	it('formats sub-week durations using their non-zero units', () => {
		const duration = 2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5_000;
		expect(formatDuration(duration)).toBe('2d 3h 4m 5s');
		expect(formatDuration(0)).toBe('0s');
	});

	it.each([
		['#ff0000', '0 100% 50%'],
		['#00ff00', '120 100% 50%'],
		['#0000ff', '240 100% 50%'],
		['#000000', '0 0% 0%'],
		['#ffffff', '0 0% 100%']
	])('converts %s to HSL', (hex, expected) => {
		expect(hexToHsl(hex)).toBe(expected);
	});
});
