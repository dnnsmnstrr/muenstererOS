import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { debugLog } from './app';
import * as LucideIcons from 'lucide-svelte';

export const defaultFiles = [
	{ id: 'projects', name: 'Projects', href: '/projects', icon: LucideIcons.FolderOpen },
	{ id: 'experiment', name: 'index.js', href: '/experiment', icon: LucideIcons.FileText, leftOffset: 3 },
];

// Icon registry for serialization
const iconRegistry = new Map<any, string>();
const iconNameMap = new Map<string, any>();

// Initialize icon mappings
Object.entries(LucideIcons).forEach(([name, component]) => {
	if (typeof component === 'function' || typeof component === 'object') {
		iconRegistry.set(component, name);
		iconNameMap.set(name, component);
	}
});

// Serialize icon component to name
export function serializeIcon(icon: any): string | undefined {
	if (!icon) return undefined;
	return iconRegistry.get(icon);
}

// Deserialize icon name to component
export function deserializeIcon(iconName: string | undefined): any {
	if (!iconName) return undefined;
	return iconNameMap.get(iconName);
}

// Files
export interface FileItem {
	id: string;
	x?: number;
	y?: number;
	leftOffset?: number;
	hidden?: boolean;
	name?: string;
	href?: string;
	icon?: any; // Runtime component reference
	iconName?: string; // Serialized icon name for localStorage
	[key: string]: any; // Allow additional properties
}

export interface FileDefinition {
	id: string;
	name: string;
	href: string;
	icon?: any;
	leftOffset?: number;
}

// DVD Bounce
export const dvdBounceActive = writable(false);

const storedFiles =
	browser && window?.localStorage?.desktopFiles
		? JSON.parse(window?.localStorage?.desktopFiles).map((file: FileItem) => ({
				...file,
				icon: deserializeIcon(file.iconName)
			}))
		: [];
export const desktopFiles = writable<FileItem[]>(storedFiles);
desktopFiles.subscribe((value) => {
	if (browser && window?.localStorage) {
		// Serialize icons before saving to localStorage
		const serializedFiles = value.map((file) => ({
			...file,
			iconName: file.icon ? serializeIcon(file.icon) : file.iconName,
			icon: undefined // Don't store the component reference
		}));
		window.localStorage.desktopFiles = JSON.stringify(serializedFiles);
	}
});

export function initializeFiles(files: FileDefinition[] = defaultFiles, padding = 20, fileSize = 60) {
	if (!browser) return;

	desktopFiles.update((existingFiles) => {
		const windowSize = {
			width: window.innerWidth,
			height: window.innerHeight
		};

		const spacing = fileSize + padding;
		const result: FileItem[] = [];

		// Process each file from the input
		files.forEach((file, index) => {
			// Check if file already exists in storage
			const existing = existingFiles.find((f) => f.id === file.id);

			if (existing) {
				// Keep existing file with all its data (position, hidden state, etc.)
				// But merge in any new properties from the file definition
				result.push({ ...file, ...existing });
			} else {
				// New file - calculate position
				const leftOffset = file.leftOffset || 0;
				let x = padding + leftOffset;
				let y = padding + index * spacing;

				// Check if would go off-screen vertically
				if (y + fileSize > windowSize.height - padding) {
					const column = Math.floor((index * spacing) / (windowSize.height - 2 * padding));
					const rowInColumn =
						index - column * Math.floor((windowSize.height - 2 * padding) / spacing);
					x = padding + leftOffset + column * spacing;
					y = padding + rowInColumn * spacing;
				}

				result.push({
					...file,
					x,
					y,
					hidden: false,
					iconName: serializeIcon(file.icon)
				});
			}
		});

		// Keep any user-added files that aren't in the default list
		existingFiles.forEach((existing) => {
			if (!files.some((f) => f.id === existing.id)) {
				result.push(existing);
			}
		});

		debugLog('Initializing files with merged data', result);
		return result;
	});
}

export function updateFilePosition(id: string, x: number, y: number) {
	desktopFiles.update((files) => files.map((file) => (file.id === id ? { ...file, x, y } : file)));
}

export function renameFile(id: string, newName: string) {
	if (!newName || !newName.trim()) return;
	desktopFiles.update((files) => 
		files.map((file) => (file.id === id ? { ...file, name: newName.trim() } : file))
	);
}

export function resetDesktopFiles() {
  desktopFiles.set([]);
  if (browser && window?.localStorage) {
    delete window.localStorage.desktopFiles;
  }
	if (defaultFiles) {
		// Reset to default files with new positions
		initializeFiles(defaultFiles);
	}
	debugLog('Desktop files reset');
}

export function hideFile(id: string) {
	desktopFiles.update((files) =>
		files.map((file) => (file.id === id ? { ...file, hidden: true } : file))
	);
	debugLog('File hidden', id);
}

export function showFile(id: string) {
	desktopFiles.update((files) =>
		files.map((file) => (file.id === id ? { ...file, hidden: false } : file))
	);
	debugLog('File shown', id);
}

export function restoreAllHiddenFiles() {
	desktopFiles.update((files) => files.map((file) => ({ ...file, hidden: false })));
	debugLog('All hidden files restored');
}

export function addFileToDesktop(file: { id: string; name: string; href: string; icon?: any }) {
	if (!browser) return;

	desktopFiles.update((files) => {
		// Check if file already exists
		const existingFile = files.find((f) => f.id === file.id);
		if (existingFile) {
			// If hidden, unhide it
			if (existingFile.hidden) {
				return files.map((f) => (f.id === file.id ? { ...f, hidden: false } : f));
			}
			// Already visible, don't add duplicate
			return files;
		}

		// Add new file - find a position that doesn't overlap
		const padding = 20;
		const fileSize = 60;
		const spacing = fileSize + padding;
		const windowSize = {
			width: window.innerWidth,
			height: window.innerHeight
		};

		// Find next available position
		const visibleFiles = files.filter((f) => !f.hidden);
		const index = visibleFiles.length;
		let x = padding;
		let y = padding + index * spacing;

		// Check if would go off-screen vertically, move to next column
		if (y + fileSize > windowSize.height - padding) {
			const column = Math.floor((index * spacing) / (windowSize.height - 2 * padding));
			const rowInColumn = index - column * Math.floor((windowSize.height - 2 * padding) / spacing);
			x = padding + column * spacing;
			y = padding + rowInColumn * spacing;
		}

		const newFile: FileItem = {
			id: file.id,
			name: file.name,
			href: file.href,
			icon: file.icon,
			iconName: serializeIcon(file.icon),
			x,
			y,
			hidden: false
		};

		debugLog('Adding file to desktop', newFile);
		return [...files, newFile];
	});
}
