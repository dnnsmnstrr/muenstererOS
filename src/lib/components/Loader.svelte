<script lang="ts">
    import { Loader } from "lucide-svelte";
	import Typewriter from "svelte-typewriter";
    interface Props {
        size?: string;
        color?: string;
        title?: string;
    }

    let { size = '12', color = 'text-primary', title = '' }: Props = $props();
</script>

<div class="flex flex-col gap-4 justify-center items-center h-full">
    <Loader class="animate-spin h-{size} w-{size} {color}" />
    {#if title}
      <Typewriter cursor={false}>
        <span>{title}</span>
      </Typewriter>
    {/if}
</div>