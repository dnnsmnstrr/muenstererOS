import Heading from './Heading.svelte';
import Kbd from './Kbd.svelte';
import Link from './Link.svelte';
import List from './List.svelte';
import Table from './Table.svelte';
import TableHead from './TableHead.svelte';
import TableBody from './TableBody.svelte';
import TableRow from './TableRow.svelte';
import TableCell from './TableCell.svelte';

export type TypographyContext = {
	renderHeadingAnchors?: boolean;
	externalLinks?: boolean;
};

const renderers = {
	heading: Heading,
	link: Link,
	list: List,
	table: Table,
	tableHead: TableHead,
	tableBody: TableBody,
	tableRow: TableRow,
	tableCell: TableCell
};

export {
	renderers,
	Heading,
	Kbd,
	Link,
	List,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell
};
