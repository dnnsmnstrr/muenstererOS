<script lang="ts">
	import { onMount } from 'svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';

	let { items }: { items: { id: string; label: string }[] } = $props();
	let activeId = $state('themes');

	onMount(() => {
		const root = document.querySelector('main');
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeId = entry.target.id;
				}
			},
			{ root, rootMargin: '0px 0px -70% 0px' }
		);

		for (const item of items) {
			const section = document.getElementById(item.id);
			if (section) observer.observe(section);
		}

		return () => observer.disconnect();
	});
</script>

<nav aria-label={i18n.t('design.on_this_page')}>
	<p class="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
		{i18n.t('design.on_this_page')}
	</p>
	<ul class="space-y-1 border-l">
		{#each items as item}
			<li>
				<a
					href={'#' + item.id}
					aria-current={activeId === item.id ? 'location' : undefined}
					class="-ml-px block border-l px-4 py-2 text-sm transition-colors hover:text-foreground"
					class:border-foreground={activeId === item.id}
					class:text-foreground={activeId === item.id}
					class:border-transparent={activeId !== item.id}
					class:text-muted-foreground={activeId !== item.id}
					onclick={(event) => {
						event.preventDefault();
						document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
						activeId = item.id;
					}}
				>
					{item.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
