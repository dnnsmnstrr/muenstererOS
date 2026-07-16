import { writable } from 'svelte/store';

// Keep the notes page maximization and sidebar collapse state synced across page navigations.
export const isNotesMaximized = writable(false);
export const isNotesSidebarCollapsed = writable(false);
