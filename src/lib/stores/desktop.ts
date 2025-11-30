import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { debugLog } from './app';

// Files
export interface FileItem {
	id: string;
	x: number;
	y: number;
	leftOffset?: number;
}

// DVD Bounce
export const dvdBounceActive = writable(false);

// Hidden Files
const storedHiddenFiles =
	browser && window?.localStorage?.hiddenFiles
		? JSON.parse(window?.localStorage?.hiddenFiles)
		: [];
export const hiddenFiles = writable<string[]>(storedHiddenFiles);
hiddenFiles.subscribe((value) => {
	if (browser && window?.localStorage) {
		window.localStorage.hiddenFiles = JSON.stringify(value);
	}
});

export interface FileDefinition {
	id: string;
	leftOffset?: number;
	[key: string]: any; // Allow additional properties like name, href, icon
}

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

export function initializeFiles(files: FileDefinition[], padding = 20, fileSize = 60) {
	if (browser) {
		const windowSize = {
			width: window.innerWidth,
			height: window.innerHeight
		};
		
		const spacing = fileSize + padding; // Vertical spacing between files
		const placedFiles: FileItem[] = [];
		
		files.forEach(({ id, leftOffset = 0 }, index) => {
			const x = padding + leftOffset;
			const y = padding + (index * spacing);
			
			// Check if file would go off-screen vertically
			if (y + fileSize > windowSize.height - padding) {
				// Start a new column
				const column = Math.floor((placedFiles.length * spacing) / (windowSize.height - 2 * padding));
				const rowInColumn = index - (column * Math.floor((windowSize.height - 2 * padding) / spacing));
				
				placedFiles.push({
					id,
					x: padding + leftOffset + (column * spacing),
					y: padding + (rowInColumn * spacing)
				});
			} else {
				placedFiles.push({ id, x, y });
			}
		});
		
		debugLog('Initializing files vertically from top left', placedFiles);
		desktopFiles.set(placedFiles);
	}
}

export function updateFilePosition(id: string, x: number, y: number) {
	desktopFiles.update(files => 
		files.map(file => file.id === id ? { ...file, x, y } : file)
	);
}

export function resetDesktopFiles() {
	desktopFiles.set([]);
	if (browser && window?.localStorage) {
		delete window.localStorage.desktopFiles;
	}
	debugLog('Desktop files reset');
}

export function hideFile(id: string) {
	hiddenFiles.update(files => {
		if (!files.includes(id)) {
			return [...files, id];
		}
		return files;
	});
	debugLog('File hidden', id);
}

export function showFile(id: string) {
	hiddenFiles.update(files => files.filter(f => f !== id));
	debugLog('File shown', id);
}