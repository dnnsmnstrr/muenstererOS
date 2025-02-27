<script lang="ts">
    import { Card } from '$lib/components/ui/card';
    import Heading from '$lib/components/typography/Heading.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
    let { nowData } = data;
    console.log(nowData)
</script>

<div class="container">
    <Heading>
        What I'm doing now
    </Heading>

    <Card>
        <p>
            {#if nowData}
                {#each Object.entries(nowData) as [key, value]}
                    <strong>{key}:</strong> {value}<br>
                {/each}
            {:else}
                Loading...
            {/if}
        </p>
    </Card>
</div>