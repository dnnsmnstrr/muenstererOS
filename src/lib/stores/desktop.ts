import { browser } from '$app/environment';
import { randomNumber } from '$lib/utils/helper';
import { writable } from 'svelte/store';
import { debugLog } from './app';

export interface FileItem {
	id: string;
	x: number;
	y: number;
}

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

const storedFiles =
	browser && window?.localStorage?.desktopFiles
		? JSON.parse(window?.localStorage?.desktopFiles)
		: [];
export const desktopFiles = writable<FileItem[]>(storedFiles);
desktopFiles.subscribe((value) => {
	if (browser && window?.localStorage) {
		window.localStorage.desktopFiles = JSON.stringify(value);
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

export function initializeFiles(fileIds: string[], fileSize = 50, padding = 20) {
	if (browser) {
		const windowSize = {
			width: window.innerWidth,
			height: window.innerHeight
		};
		
		const files: FileItem[] = fileIds.map((id, index) => {
			const randomX = randomNumber(
				windowSize.width / 2 - padding - index * 20,
				windowSize.width / 2 + padding + index * 20
			);
			const randomY = randomNumber(
				windowSize.height / 3 - padding - index * 20,
				windowSize.height / 3 + padding + index * 20
			);
			return { id, x: randomX, y: randomY };
		});
		
		debugLog('Initializing files to random positions', files);
		desktopFiles.set(files);
	}
}

export function updateFilePosition(id: string, x: number, y: number) {
	desktopFiles.update(files => 
		files.map(file => file.id === id ? { ...file, x, y } : file)
	);
}