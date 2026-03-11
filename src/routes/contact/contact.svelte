<script>
	import Heading from "$lib/components/typography/Heading.svelte";
	import { links } from "$lib/config";
	import { i18n } from "$lib/i18n/i18n.svelte";

</script>

<svelte:head>
	<title>{i18n.t('contact.title')}</title>
</svelte:head>

<div>
    <Heading>{i18n.t('contact.title')}</Heading>

    <p>
        {i18n.t('contact.description')} <a href={links.mailto}>{links.email}</a>
    </p>
</div>
