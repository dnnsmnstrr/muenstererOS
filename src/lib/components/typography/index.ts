import Blockquote from './Blockquote.svelte';
import Heading from './Heading.svelte';
import Kbd from './Kbd.svelte';
import Link from './Link.svelte';
import List from './List.svelte';

export type TypographyContext = {
	renderHeadingAnchors?: boolean;
	externalLinks?: boolean;
};

const renderers = {
	blockquote: Blockquote,
	heading: Heading,
	link: Link,
	list: List
};

export { renderers, Blockquote, Heading, Kbd, Link, List };
