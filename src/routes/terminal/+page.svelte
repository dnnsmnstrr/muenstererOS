<script lang="ts">
	import Heading from '$lib/components/typography/Heading.svelte';
	import * as Terminal from '$lib/components/ui/terminal';

	const pageTitle = 'Terminal';
	const pageDescription = 'A command line interface for the website.';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<div class="container">
	<Heading>{pageTitle}</Heading>
	<Terminal.Root class="m-6 max-w-xl" delay={250}>
		<!-- <Terminal.TypingAnimation>&gt; jsrepo add ui/terminal</Terminal.TypingAnimation> -->

		<Terminal.Loading delay={500}>
			{#snippet loadingMessage()}
				init muenstererOS
			{/snippet}
			{#snippet completeMessage()}
				<span class="text-green-500">
					✔ CLI ready
				</span>
			{/snippet}
		</Terminal.Loading>

        <Terminal.Input placeholder="Type your command...">
            {#snippet input()}
                &gt; jsrepo add ui/terminal
            {/snippet}
            {#snippet output()}
                <span class="text-green-500">
                    ✔ Command executed successfully
                </span>
            {/snippet}
        </Terminal.Input>
	</Terminal.Root>
</div>
