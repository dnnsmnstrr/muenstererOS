<script>
	import Heading from '$lib/components/typography/Heading.svelte';
	import Link from '$lib/components/typography/Link.svelte';
	import List from '$lib/components/typography/List.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { OWNER_NAME, links } from '$lib/config';
	import { Github } from 'lucide-svelte';
</script>

<svelte:head>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="container pb-8 md:p-12">
	<div class="mb-6 flex max-w-xl flex-row justify-between gap-4">
		<Heading>About</Heading>
		<Button href={links.source}>
			<Github class="mr-2 h-5 w-5" />
			Source Code
		</Button>
	</div>
	<Card.Root class="max-w-xl">
		<Card.Header>
			<p>
				This is page was created by <Button
					href={links.cv}
					size="sm"
					variant="outline"
					class="ml-1 mt-2">{OWNER_NAME}</Button
				>
				<br />
				<br />
				Check out the <Link href="/log">Changelog</Link> to see how it has evolved over time.
				<br />
				<br />

				It is built with <Link href="https://kit.svelte.dev" target="_blank">SvelteKit</Link>
				and <Link href="https://www.shadcn-svelte.com/" target="_blank">shadcn-svelte</Link>.
				Hosted on <Link href="https://vercel.com/">Vercel</Link>
			</p>
		</Card.Header>
		<Card.Content>
			<span> Some other the projects being used: </span>
			<ScrollArea class="mt-4 h-32 rounded-md border md:h-36">
				<List class="my-0">
					<li><Link href="https://tailwindcss.com/">TailwindCSS</Link></li>
					<li><Link href="https://lucide.dev/icons/">Lucide Icons</Link></li>
					<li><Link href="https://svelte-legos.surge.sh/">Svelte Legos</Link></li>
					<li>
						<Link href="https://www.npmjs.com/package/svelte-typewriter">Svelte Typewriter</Link>
					</li>
					<li><Link href="https://www.shadcn-svelte-extras.com/">Shadcn Svelte Extras</Link></li>
					<li><Link href="https://www.movingicons.dev/">Moving Icons</Link></li>
				</List>
			</ScrollArea>
		</Card.Content>
		<Card.Footer class="justify-between">
			<Button variant="link" href="/humans.txt" class="mb-4">
				<img src="/images/humanstxt.png" alt="" />
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
