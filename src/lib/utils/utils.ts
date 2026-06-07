/*
	Installed from @ieedan/shadcn-svelte-extras
*/

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Merges an existing rel attribute with noopener and noreferrer if the target is _blank
 * @param rel existing rel attribute
 * @param target link target
 * @returns merged rel attribute
 */
export function getRel(rel?: string | null, target?: string | null): string | undefined {
	if (target !== '_blank') return rel || undefined;

	const parts = rel ? rel.split(/\s+/).filter(Boolean) : [];
	if (!parts.includes('noopener')) parts.push('noopener');
	if (!parts.includes('noreferrer')) parts.push('noreferrer');

	return parts.join(' ');
}
