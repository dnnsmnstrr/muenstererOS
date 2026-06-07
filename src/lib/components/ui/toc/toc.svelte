<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils/utils';
	import { i18n } from '$lib/i18n/i18n.svelte';

	interface Props {
		selector?: string;
		class?: string;
	}

	let { selector = '.prose', class: className }: Props = $props();

	let headings = $state<{ id: string; text: string; level: number }[]>([]);
	let activeId = $state('');

	function updateHeadings() {
		const container = document.querySelector(selector);
		if (!container) return;

		const elements = Array.from(container.querySelectorAll('h1, h2, h3'));
		headings = elements.map((el) => {
			if (!el.id) {
				el.id =
					el.textContent?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).substr(2, 9);
			}
			return {
				id: el.id,
				text: el.textContent || '',
				level: parseInt(el.tagName[1])
			};
		});
	}

	onMount(() => {
		updateHeadings();

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
					}
				});
			},
			{ rootMargin: '0% 0% -80% 0%' }
		);

		const container = document.querySelector(selector);
		if (container) {
			container.querySelectorAll('h1, h2, h3').forEach((el) => observer.observe(el));
		}

		return () => observer.disconnect();
	});

	// Re-run if selector content changes
	$effect(() => {
		if (selector) {
			updateHeadings();
		}
	});
</script>

<nav class={cn('space-y-1', className)}>
	{#if headings.length > 0}
		<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
			{i18n.t('notes.on_this_page') || 'On this page'}
		</p>
		<ul class="space-y-2 text-sm">
			{#each headings as heading}
				<li class={cn(heading.level === 3 ? 'ml-4' : heading.level === 2 ? 'ml-2' : '')}>
					<a
						href="#{heading.id}"
						class={cn(
							'hover:text-primary transition-colors',
							activeId === heading.id ? 'font-medium text-primary' : 'text-muted-foreground'
						)}
						onclick={(e) => {
							e.preventDefault();
							document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
						}}
					>
						{heading.text}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</nav>
