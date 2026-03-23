<script lang="ts">
	import Heading from '$lib/components/typography/Heading.svelte';
	import Link from '$lib/components/typography/Link.svelte';
	import type { PageProps } from './$types';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { formatDate } from '$lib/utils/helper';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<!-- Use localized title for the sitemap page -->
	<title>{i18n.t('common.sitemap')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<div class="container pb-8 md:p-12">
	<!-- Use localized heading -->
	<Heading>{i18n.t('common.sitemap')}</Heading>
	<ul class="mt-4 space-y-2">
		{#each data.urls as url}
			<li>
				<Link href={url.href}>
					<!-- Dynamically localize page titles based on their slug -->
					{i18n.t('common.' + url.slug) !== 'common.' + url.slug
						? i18n.t('common.' + url.slug)
						: url.title}
					<!-- Localize the date formatting based on the current language -->
					<span class="ml-1 text-sm text-muted-foreground">({formatDate(url.lastModified)})</span>
				</Link>
			</li>
		{/each}
	</ul>
</div>
