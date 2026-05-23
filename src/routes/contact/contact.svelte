<script>
	import Heading from "$lib/components/typography/Heading.svelte";
	import { links } from "$lib/config";
	import { i18n } from "$lib/i18n/i18n.svelte";
	import { PAGE_TITLE_SUFFIX } from "$lib/config";

	/**
	 * Localization optimization: Aligns the Contact page with the application's standard
	 * metadata pattern by adding the PAGE_TITLE_SUFFIX and a localized meta description
	 * for improved i18n and SEO.
	 */
</script>

<svelte:head>
	<title>{i18n.t('contact.title')}{PAGE_TITLE_SUFFIX}</title>
	<meta name="description" content={i18n.t('contact.meta_description')} />
</svelte:head>

<div>
    <Heading>{i18n.t('contact.title')}</Heading>

    <p>
        {i18n.t('contact.description')} <a href={links.mailto}>{links.email}</a>
    </p>
</div>
