<script lang="ts">
    import { Card } from '$lib/components/ui/card';
    import Heading from '$lib/components/typography/Heading.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
    let { nowData } = data;
</script>

<div class="container">
    <Heading>
        What I'm doing now
    </Heading>

    <Card>
        <p>
            <strong>Status:</strong> {nowData.status}
        </p>
        <p>
            <strong>Location:</strong> {nowData.location}
        </p>
        <p>
            <strong>Playlist:</strong> <a href={`https://open.spotify.com/playlist/${nowData.playlist.uri}`} target="_blank">{nowData.playlist.name}</a>
        </p>
        <div>
            <strong>Activities:</strong>
            <ul>
                {#each nowData.activities as activity}
                    <li>{activity}</li>
                {/each}
            </ul>
        </div>
        <div>
            <strong>Plans:</strong>
            <ul>
                {#each nowData.plans as plan}
                    <li>{plan}</li>
                {/each}
            </ul>
        </div>
        <div>
            <strong>Projects:</strong>
            <ul>
                {#each nowData.projects as project}
                    <li>{@html project}</li>
                {/each}
            </ul>
        </div>
    </Card>
</div>