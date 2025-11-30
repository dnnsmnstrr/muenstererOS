import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { debugLog } from './app';

// Files
export interface FileItem {
	id: string;
	x: number;
	y: number;
	leftOffset?: number;
	hidden?: boolean;
  [key: string]: any; // Allow additional properties like name, href, icon
}

// DVD Bounce
export const dvdBounceActive = writable(false);

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

export function initializeFiles(files: FileItem[], padding = 20, fileSize = 60) {
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
	desktopFiles.update(files =>
		files.map(file => file.id === id ? { ...file, hidden: true } : file)
	);
	debugLog('File hidden', id);
}

export function showFile(id: string) {
	desktopFiles.update(files =>
		files.map(file => file.id === id ? { ...file, hidden: false } : file)
	);
	debugLog('File shown', id);
}

export function restoreAllHiddenFiles() {
	desktopFiles.update(files =>
		files.map(file => ({ ...file, hidden: false }))
	);
	debugLog('All hidden files restored');
}