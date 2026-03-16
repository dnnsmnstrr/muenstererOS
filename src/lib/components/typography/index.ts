import Heading from './Heading.svelte';
import Kbd from './Kbd.svelte';
import Link from './Link.svelte';
import List from './List.svelte';

export type TypographyContext = {
	renderHeadingAnchors?: boolean;
	externalLinks?: boolean;
};

const renderers = {
	heading: Heading,
	link: Link,
	list: List
};

export { renderers, Heading, Kbd, Link, List };
