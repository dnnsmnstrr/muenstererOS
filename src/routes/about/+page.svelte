<script lang="ts">
	import Heading from '$lib/components/typography/Heading.svelte';
	import Link from '$lib/components/typography/Link.svelte';
	import List from '$lib/components/typography/List.svelte';
	import ButtonMarquee from '$lib/components/ButtonMarquee.svelte';
	import * as Card from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { OWNER_NAME, links } from '$lib/config';
	import { Github } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { formatDate } from '$lib/utils/helper';

	interface Status {
		lastDeployment: string;
		commitCount: number;
		pageCount: number;
	}

	let status = $state<Status | null>(null);

	onMount(async () => {
		try {
			const response = await fetch('/api/status');
			status = await response.json();
		} catch (e) {
			console.error('Failed to fetch status', e);
		}
	});

	function getFriendlyTime(date: Date) {
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		if (diffInSeconds < 60) return i18n.t('about.just_now');
		const diffInMinutes = Math.floor(diffInSeconds / 60);
		if (diffInMinutes < 60) return i18n.t('about.m_ago', { count: diffInMinutes.toString() });
		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return i18n.t('about.h_ago', { count: diffInHours.toString() });
		const diffInDays = Math.floor(diffInHours / 24);
		return i18n.t('about.d_ago', { count: diffInDays.toString() });
	}

	let lastDeploymentDate = $derived(status ? new Date(status.lastDeployment) : null);
	let isRecent = $derived(
		lastDeploymentDate
			? new Date().getTime() - lastDeploymentDate.getTime() < 2 * 24 * 60 * 60 * 1000
			: false
	);

	let displayTime = $derived.by(() => {
		if (!lastDeploymentDate) return '';
		if (isRecent) return getFriendlyTime(lastDeploymentDate);
		return formatDate(lastDeploymentDate.toISOString());
	});

	let titleTime = $derived.by(() => {
		if (!lastDeploymentDate) return '';
		if (isRecent) return lastDeploymentDate.toISOString();
		return getFriendlyTime(lastDeploymentDate);
	});
</script>

<svelte:head>
	<title>{i18n.t('about.title')}</title>
	<meta name="description" content={i18n.t('about.title')} />
</svelte:head>

<div class="container pb-8 md:p-12">
	<div class="mb-6 flex max-w-xl flex-row justify-between gap-4">
		<Heading>{i18n.t('about.title')}</Heading>
		<Button href={links.source}>
			<Github class="mr-2 h-5 w-5" />
			{i18n.t('about.source_code')}
		</Button>
	</div>
	<Card.Root class="max-w-xl">
		<Card.Header>
			<p>
				{i18n.t('about.description_prefix')}
				<Button href={links.cv} size="sm" variant="outline" class="ml-1 mt-2">{OWNER_NAME}</Button>
				{i18n.t('about.description_suffix')}
				<br />
				<br />
				{i18n.t('about.changelog_prefix')}
				<Link href="/log">{i18n.t('about.changelog_link')}</Link>
				{i18n.t('about.changelog_suffix')}
				<br />
				<br />

				{i18n.t('about.built_with_prefix')}
				<Link href="https://kit.svelte.dev" target="_blank">SvelteKit</Link>
				{i18n.t('about.built_with_and')}
				<Link href="https://www.shadcn-svelte.com/" target="_blank">shadcn-svelte</Link>.
				{i18n.t('about.hosted_on')}
				<Link href="https://vercel.com/">Vercel</Link>
			</p>
		</Card.Header>
		<Card.Content>
			<span> {i18n.t('about.projects_used')} </span>
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
		<Card.Footer class="flex-col items-stretch gap-4 text-xs text-muted-foreground">
			<ButtonMarquee />
			{#if status}
				<div class="flex justify-end">
					<Link
						href="/status"
						class="flex flex-col items-end gap-1 font-normal text-muted-foreground decoration-muted-foreground/50 transition-colors hover:text-foreground"
					>
						<span title={titleTime}>
							{i18n.t('about.last_deployment')}
							{displayTime}
						</span>
					</Link>
				</div>
			{/if}
		</Card.Footer>
	</Card.Root>
</div>
