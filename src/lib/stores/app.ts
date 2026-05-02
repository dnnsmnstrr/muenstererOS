import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import { cssVarStore } from '@sveltelegos-blue/svelte-legos';
import { defaultColors } from '$lib/config';
import { mode } from 'mode-watcher';
import { updateMetaThemeColor } from '$lib/utils/browser';

let currentMode = get(mode);
const DEFAULT_THEME = 'zinc';
const storedTheme = browser ? window?.localStorage?.theme : DEFAULT_THEME;
export const theme = writable(storedTheme || DEFAULT_THEME);

theme.subscribe((value) => {
	if (browser && window?.localStorage) {
		window.localStorage.theme = String(value);
	}
});
mode.subscribe((value) => {
	updateMetaThemeColor(value === 'dark' ? '#000000' : '#ffffff');
});

export const primaryColor = cssVarStore('--primary', {
	initialValue: defaultColors[currentMode || 'dark'].primary
});
export const backgroundColor = cssVarStore('--background', {
	initialValue: defaultColors[currentMode || 'dark'].background
});
export const modifiedColors = writable(false);
primaryColor.subscribe((color) => modifiedColors.set(true));
backgroundColor.subscribe((color) => modifiedColors.set(true));
export function resetColors() {
	debugLog('Resetting colors...');
	currentMode = get(mode);
	primaryColor.set(defaultColors[currentMode || 'dark'].primary);
	backgroundColor.set(defaultColors[currentMode || 'dark'].background);
	modifiedColors.set(false);
}
// command
export const isCommandActive = writable(false);
export const showHelp = writable(false);

// debug mode
const storedDebugSetting = browser ? window?.localStorage?.debug === 'true' : false;
export const debug = writable<boolean>(storedDebugSetting);
debug.subscribe((value) => {
	if (browser && window?.localStorage) {
		window.localStorage.debug = String(value);
	}
});

export function debugLog(...args: any[]) {
	if (!browser) return;
	const isDebugActive = get(debug);
	if (isDebugActive && browser) {
		console.log(...args);
	}
}

// screensaver
const storedScreensaverSetting = browser ? window?.localStorage?.screensaver : 'dvd';
export const screensaver = writable<string>(storedScreensaverSetting || 'dvd');
screensaver.subscribe((value) => {
	if (browser && window?.localStorage) {
		window.localStorage.screensaver = String(value);
	}
});

export const DEFAULT_INACTIVITY_TIMEOUT = 30;
const storedInactivityTimeout = browser ? window?.localStorage?.inactivityTimeout : String(DEFAULT_INACTIVITY_TIMEOUT);
export const inactivityTimeout = writable<number>(Number(storedInactivityTimeout) || DEFAULT_INACTIVITY_TIMEOUT);
inactivityTimeout.subscribe((value) => {
	if (browser && window?.localStorage) {
		window.localStorage.inactivityTimeout = String(value);
	}
});

// background texture
const storedBackgroundTexture = browser ? window?.localStorage?.backgroundTexture : 'dots';
export const backgroundTexture = writable<string>(storedBackgroundTexture || 'dots');
backgroundTexture.subscribe((value) => {
	if (browser && window?.localStorage) {
		window.localStorage.backgroundTexture = String(value);
	}
});

export const DEFAULT_BACKGROUND_SIZE = 1;
const storedBackgroundSize = browser ? window?.localStorage?.backgroundSize : String(DEFAULT_BACKGROUND_SIZE);
export const backgroundSize = writable<number>(Number(storedBackgroundSize) || DEFAULT_BACKGROUND_SIZE);
backgroundSize.subscribe((value) => {
	if (browser && window?.localStorage) {
		window.localStorage.backgroundSize = String(value);
	}
});

export const DEFAULT_BACKGROUND_SPACING = 16;
const storedBackgroundSpacing = browser ? window?.localStorage?.backgroundSpacing : String(DEFAULT_BACKGROUND_SPACING);
export const backgroundSpacing = writable<number>(Number(storedBackgroundSpacing) || DEFAULT_BACKGROUND_SPACING);
backgroundSpacing.subscribe((value) => {
	if (browser && window?.localStorage) {
		window.localStorage.backgroundSpacing = String(value);
	}
});
