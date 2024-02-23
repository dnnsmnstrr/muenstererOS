import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import { cssVarStore } from 'svelte-legos';
import { defaultColors } from '$lib/config';
import { mode } from 'mode-watcher';

let currentMode = get(mode);
export const primaryColor = cssVarStore('--primary', {
	initialValue: defaultColors[currentMode || 'dark'].primary
});
export const backgroundColor = cssVarStore('--background', {
	initialValue: defaultColors[currentMode || 'dark'].background
});
export function resetColors () {
  debugLog('Resetting colors...');
  currentMode = get(mode)
  primaryColor.set(defaultColors[currentMode || 'dark'].primary);
  backgroundColor.set(defaultColors[currentMode || 'dark'].background);
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
})
export function debugLog(...args: any[]) {
  const isDebugActive = get(debug)
  if (isDebugActive && browser) {
    console.log(...args);
  }
}