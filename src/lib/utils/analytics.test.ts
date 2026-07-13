import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackRedirect, trackCommandEvent } from './analytics';

describe('analytics utilities', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// Set up clean global state
		if (typeof window !== 'undefined') {
			delete (window as any).goatcounter;
		} else {
			(global as any).window = {};
		}
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('should gracefully handle server-side environments (no window)', () => {
		const originalWindow = global.window;
		// Temporarily delete window
		delete (global as any).window;

		const callback = vi.fn();
		trackRedirect('github', callback);

		expect(callback).toHaveBeenCalled();

		// Restore original window
		global.window = originalWindow;
	});

	it('should track immediately if goatcounter is already loaded', () => {
		const mockCount = vi.fn();
		(window as any).goatcounter = { count: mockCount };

		const callback = vi.fn();
		trackRedirect('github', callback);

		expect(mockCount).toHaveBeenCalledWith({
			path: 'redirect-github',
			title: 'Redirect: github',
			event: true
		});

		// Check callback is called after 100ms safe delay
		expect(callback).not.toHaveBeenCalled();
		vi.advanceTimersByTime(100);
		expect(callback).toHaveBeenCalled();
	});

	it('should track after polling if goatcounter loads with a delay', () => {
		const mockCount = vi.fn();
		const callback = vi.fn();

		trackRedirect('instagram', callback);

		// Not loaded initially
		expect(mockCount).not.toHaveBeenCalled();

		// Advance timer to first interval (100ms)
		vi.advanceTimersByTime(100);
		expect(mockCount).not.toHaveBeenCalled();

		// Simulate GoatCounter loading
		(window as any).goatcounter = { count: mockCount };

		// Advance to next interval (200ms)
		vi.advanceTimersByTime(100);
		expect(mockCount).toHaveBeenCalledWith({
			path: 'redirect-instagram',
			title: 'Redirect: instagram',
			event: true
		});

		// Check callback is called after safety delay
		expect(callback).not.toHaveBeenCalled();
		vi.advanceTimersByTime(100);
		expect(callback).toHaveBeenCalled();
	});

	it('should timeout and call callback anyway if goatcounter fails to load within 500ms', () => {
		const callback = vi.fn();

		trackRedirect('twitter', callback);

		// Advance time 500ms (5 attempts)
		vi.advanceTimersByTime(500);

		// Callback should have been called despite missing GoatCounter
		expect(callback).toHaveBeenCalled();
	});

	describe('trackCommandEvent', () => {
		it('should gracefully handle server-side environments (no window)', () => {
			const originalWindow = global.window;
			delete (global as any).window;

			// Should run without throwing errors
			expect(() => trackCommandEvent('command.toggle_dark_mode', 'Toggle Dark Mode')).not.toThrow();

			global.window = originalWindow;
		});

		it('should track immediately if goatcounter is already loaded', () => {
			const mockCount = vi.fn();
			(window as any).goatcounter = { count: mockCount };

			trackCommandEvent('command.toggle_dark_mode', 'Toggle Dark Mode');

			expect(mockCount).toHaveBeenCalledWith({
				path: 'command-command.toggle_dark_mode',
				title: 'Command: Toggle Dark Mode',
				event: true
			});
		});

		it('should use id as fallback for name if name is not provided', () => {
			const mockCount = vi.fn();
			(window as any).goatcounter = { count: mockCount };

			trackCommandEvent('command.toggle_dark_mode');

			expect(mockCount).toHaveBeenCalledWith({
				path: 'command-command.toggle_dark_mode',
				title: 'Command: command.toggle_dark_mode',
				event: true
			});
		});

		it('should track after polling if goatcounter loads with a delay', () => {
			const mockCount = vi.fn();

			trackCommandEvent('command.confetti', 'Confetti');

			// Not loaded initially
			expect(mockCount).not.toHaveBeenCalled();

			// Advance timer to first interval (100ms)
			vi.advanceTimersByTime(100);
			expect(mockCount).not.toHaveBeenCalled();

			// Simulate GoatCounter loading
			(window as any).goatcounter = { count: mockCount };

			// Advance to next interval (200ms)
			vi.advanceTimersByTime(100);
			expect(mockCount).toHaveBeenCalledWith({
				path: 'command-command.confetti',
				title: 'Command: Confetti',
				event: true
			});
		});

		it('should timeout if goatcounter fails to load within 500ms', () => {
			trackCommandEvent('command.search_zettelkasten', 'Search');

			// Advance time 500ms (5 attempts)
			vi.advanceTimersByTime(500);

			// Should not throw or cause issue
		});
	});
});
