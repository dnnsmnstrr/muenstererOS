import { writable } from 'svelte/store';

export interface NowPlayingState {
	y: number;
	side: 'left' | 'right';
	expanded: boolean;
}

const defaultState: NowPlayingState = {
	y: 208,
	side: 'right',
	expanded: false
};

function createNowPlayingStore() {
	const { subscribe, set, update } = writable<NowPlayingState>(defaultState);

	return {
		subscribe,
		setPosition: (y: number, side: 'left' | 'right') =>
			update((state) => ({ ...state, y, side })),
		setExpanded: (expanded: boolean) =>
			update((state) => ({ ...state, expanded })),
		reset: () => set(defaultState),
		loadFromStorage: () => {
			if (typeof window !== 'undefined') {
				const stored = localStorage.getItem('nowplaying-state');
				if (stored) {
					try {
						set(JSON.parse(stored));
					} catch (e) {
						console.error('Failed to load nowplaying state:', e);
					}
				}
			}
		},
		saveToStorage: (state: NowPlayingState) => {
			if (typeof window !== 'undefined') {
				localStorage.setItem('nowplaying-state', JSON.stringify(state));
			}
		}
	};
}

export const nowPlayingStore = createNowPlayingStore();
