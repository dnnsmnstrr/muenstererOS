export type NoteRecommendation = {
	slug: string;
	reason?: string;
};

export const noteRecommendations = [
	// Add recommended notes here, for example:
	// { slug: 'building-muensterer-os', reason: 'A tour of how this website works.' }
	{ slug: 'ideas', reason: 'Some of my ideas.' },
	{ slug: 'kickstarter', reason: 'My Kickstarter experience.' },
	{ slug: 'defaults', reason: 'The default apps I use.' }
] satisfies NoteRecommendation[];
