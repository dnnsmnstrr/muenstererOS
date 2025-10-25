<script lang="ts">
    import Heading from "$lib/components/typography/Heading.svelte";
    import Link from "$lib/components/typography/Link.svelte";
    import type { PageProps } from './$types';

	let { data }: PageProps = $props();
    console.log(data.urls)
</script>

<div class="container">
    <Heading>Sitemap</Heading>
    <ul>
        {#each data.urls as url}
            <li><Link href={url.href}>{url.title} ({url.lastModified})</Link></li>
        {/each}
    </ul>
</div>