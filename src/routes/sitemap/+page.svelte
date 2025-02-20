<script lang="ts">
    import Heading from "$lib/components/typography/Heading.svelte";
    import Link from "$lib/components/typography/Link.svelte";
    export let urls: string[] = [];
</script>

<div class="container">
    <Heading>Sitemap</Heading>
    <ul>
        {#each urls as url}
            <li><Link href={url}>{url}</Link></li>
        {/each}
    </ul>
</div>