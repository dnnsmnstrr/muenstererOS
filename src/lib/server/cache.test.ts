import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gistCache } from './cache';

describe('gistCache', () => {
	beforeEach(() => {
		gistCache.clear();
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
	});

	afterEach(() => {
		gistCache.clear();
		vi.useRealTimers();
	});

	it('returns a stored value before its TTL expires', () => {
		gistCache.set('now', { status: 'online' }, 60);
		vi.advanceTimersByTime(59_999);

		expect(gistCache.get('now')).toEqual({ status: 'online' });
	});

	it('evicts a stored value after its TTL expires', () => {
		gistCache.set('now', { status: 'online' }, 60);
		vi.advanceTimersByTime(60_001);

		expect(gistCache.get('now')).toBeNull();
	});

	it('deletes one entry without affecting another', () => {
		gistCache.set('now', { value: 1 }, 60);
		gistCache.set('projects', { value: 2 }, 60);

		gistCache.delete('now');

		expect(gistCache.get('now')).toBeNull();
		expect(gistCache.get('projects')).toEqual({ value: 2 });
	});

	it('clears all entries', () => {
		gistCache.set('now', { value: 1 }, 60);
		gistCache.set('projects', { value: 2 }, 60);

		gistCache.clear();

		expect(gistCache.get('now')).toBeNull();
		expect(gistCache.get('projects')).toBeNull();
	});
});
