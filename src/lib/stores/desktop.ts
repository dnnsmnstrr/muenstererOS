import { browser } from '$app/environment';
import { randomNumber } from '$lib/utils/helper';
import { writable } from 'svelte/store';
import { debugLog } from './app';

const storedPosition =
	browser && window?.localStorage?.filePosition
		? JSON.parse(window?.localStorage?.filePosition)
		: { x: 0, y: 0 };
export const filePosition = writable<{ x: number; y: number }>(storedPosition);
filePosition.subscribe((value) => {
	if (browser && window?.localStorage) {
		window.localStorage.filePosition = JSON.stringify(value);
	}
});

export function initializeFile(fileSize = 50) {
  if (browser) {
    const windowSize = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    const padding = 20
    const randomX = randomNumber(windowSize.width / 2 - padding, windowSize.width / 2 + padding)
    const randomY = randomNumber(windowSize.height / 3 - padding, windowSize.height / 3 + padding);
    debugLog("Initializing file to random position", randomX, randomY);
    filePosition.set({
			x: randomX,
			y: randomY,
		});
  }
}