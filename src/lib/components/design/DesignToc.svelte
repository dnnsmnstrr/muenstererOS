<script lang="ts">
	import { onMount } from 'svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';

	type TocItem = { id: string; label: string; children?: TocItem[] };

	let { items }: { items: TocItem[] } = $props();
	let activeId = $state('themes');
	const observedItems = $derived(items.flatMap((item) => [item, ...(item.children ?? [])]));

	function scrollTo(id: string) {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
		activeId = id;
	}

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

		for (const item of observedItems) {
			const section = document.getElementById(item.id);
			if (section) observer.observe(section);
		}

		return () => observer.disconnect();
	});
</script>

<nav
	aria-label={i18n.t('design.on_this_page')}
	class="max-h-[calc(100dvh-3rem)] overflow-y-auto pr-2"
>
	<p class="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
		{i18n.t('design.on_this_page')}
	</p>
	<ul class="space-y-1 border-l">
		{#each items as item}
			<li>
				<a
					href={'#' + item.id}
					aria-current={activeId === item.id ||
					item.children?.some((child) => child.id === activeId)
						? 'location'
						: undefined}
					class="-ml-px block border-l px-4 py-2 text-sm transition-colors hover:text-foreground"
					class:border-foreground={activeId === item.id ||
						item.children?.some((child) => child.id === activeId)}
					class:text-foreground={activeId === item.id ||
						item.children?.some((child) => child.id === activeId)}
					class:border-transparent={activeId !== item.id &&
						!item.children?.some((child) => child.id === activeId)}
					class:text-muted-foreground={activeId !== item.id &&
						!item.children?.some((child) => child.id === activeId)}
					onclick={(event) => {
						event.preventDefault();
						scrollTo(item.id);
					}}
				>
					{item.label}
				</a>
				{#if item.children}
					<ul class="pb-1">
						{#each item.children as child}
							<li>
								<a
									href={'#' + child.id}
									aria-current={activeId === child.id ? 'location' : undefined}
									class="block py-1.5 pl-7 pr-2 text-xs transition-colors hover:text-foreground"
									class:text-foreground={activeId === child.id}
									class:font-medium={activeId === child.id}
									class:text-muted-foreground={activeId !== child.id}
									onclick={(event) => {
										event.preventDefault();
										scrollTo(child.id);
									}}
								>
									{child.label}
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
</nav>
