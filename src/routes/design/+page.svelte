<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowUpRight, Search, Command } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { examples } from '$lib/components/design/catalog';
	import CopyButton from '$lib/components/design/CopyButton.svelte';
	import DesignToc from '$lib/components/design/DesignToc.svelte';
	import ThemeViewer from '$lib/components/design/ThemeViewer.svelte';
	let ready = $state(false);
	onMount(() => {
		ready = true;
	});
	let search = $state('');
	let reset = $state(0);
	const filtered = $derived(
		examples.filter((example) =>
			`${example.id} ${i18n.t('design.examples.' + example.id + '.title')} ${i18n.t('design.examples.' + example.id + '.description')}`
				.toLowerCase()
				.includes(search.toLowerCase().trim())
		)
	);
	const tocItems = $derived([
		{ id: 'themes', label: i18n.t('design.themes') },
		{ id: 'components', label: i18n.t('design.components') },
		{ id: 'guidelines', label: i18n.t('design.guidelines') }
	]);
</script>

<svelte:head>
	<title>{i18n.t('design.title') + PAGE_TITLE_SUFFIX}</title>
	<meta name="description" content={i18n.t('design.description')} />
</svelte:head>

<div class="container min-w-0 space-y-12 pb-16" data-design-library data-ready={ready}>
	<header class="space-y-5 border-b pb-8">
		<p class="font-mono text-xs uppercase tracking-widest text-muted-foreground">
			{i18n.t('design.eyebrow')}
		</p>
		<div class="flex flex-wrap items-start justify-between gap-5">
			<div>
				<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">{i18n.t('design.title')}</h1>
				<p class="mt-4 max-w-2xl text-muted-foreground">{i18n.t('design.description')}</p>
			</div>
			<Button href="/design.md" variant="outline">{i18n.t('design.spec')}<ArrowUpRight /></Button>
		</div>
		<nav aria-label={i18n.t('design.navigation')} class="flex flex-wrap gap-2">
			<Button href="#themes" variant="secondary">{i18n.t('design.themes')}</Button><Button
				href="#components"
				variant="ghost"
				>{i18n.t('design.components')}
				<span class="text-muted-foreground">{examples.length}</span></Button
			><Button href="#guidelines" variant="ghost">{i18n.t('design.guidelines')}</Button>
		</nav>
	</header>
	<div class="grid items-start gap-12 2xl:grid-cols-[minmax(0,1fr)_12rem]">
		<div class="design-content min-w-0 space-y-12">
			<ThemeViewer />
			<section id="components" class="scroll-mt-24 space-y-6" aria-labelledby="components-title">
				<div class="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p class="mb-2 font-mono text-xs text-muted-foreground">
							02 / {i18n.t('design.components')}
						</p>
						<h2 id="components-title" class="text-2xl font-semibold tracking-tight">
							{i18n.t('design.playground')}
						</h2>
						<p class="mt-2 max-w-2xl text-sm text-muted-foreground">
							{i18n.t('design.component_description')}
						</p>
					</div>
					<Button variant="outline" onclick={() => reset++}>{i18n.t('design.reset')}</Button>
				</div>
				<div class="relative max-w-md">
					<Search
						class="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"
					/><Input
						class="pl-9"
						type="search"
						bind:value={search}
						placeholder={i18n.t('design.search')}
						aria-label={i18n.t('design.search')}
					/>
				</div>
				<p class="sr-only" role="status">{filtered.length} {i18n.t('design.components')}</p>
				<div class="grid items-start gap-6 lg:grid-cols-2">
					{#each filtered as example (example.id)}
						<article
							id={'example-' + example.id}
							class="min-w-0 scroll-mt-24 overflow-hidden rounded-lg border"
							aria-labelledby={'title-' + example.id}
						>
							<div class="border-b p-5">
								<h3 id={'title-' + example.id} class="font-semibold">
									{i18n.t('design.examples.' + example.id + '.title')}
								</h3>
								<p class="mt-1 text-sm text-muted-foreground">
									{i18n.t('design.examples.' + example.id + '.description')}
								</p>
							</div>
							<div
								class="flex min-h-48 items-center bg-background p-6"
								data-example-preview={example.id}
							>
								{#key reset}<example.component />{/key}
							</div>
							<div class="space-y-3 border-t bg-muted/20 p-4">
								<CopyButton text={example.source} label={i18n.t('design.copy')} />
								<details>
									<summary class="cursor-pointer text-xs font-medium text-muted-foreground"
										>{i18n.t('design.source')}</summary
									>
									<!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable source must be keyboard reachable.) -->
									<pre
										class="mt-3 max-h-96 overflow-auto rounded-md border bg-background p-4 text-xs leading-relaxed"
										role="region"
										tabindex="0"
										aria-label={i18n.t('design.source')}><code>{example.source}</code></pre>
								</details>
							</div>
						</article>
					{:else}<p class="py-12 text-muted-foreground">{i18n.t('design.empty')}</p>{/each}
				</div>
			</section>
			<section
				id="guidelines"
				class="scroll-mt-24 rounded-lg border p-6"
				aria-labelledby="guidelines-title"
			>
				<p class="mb-2 font-mono text-xs text-muted-foreground">
					03 / {i18n.t('design.guidelines')}
				</p>
				<h2 id="guidelines-title" class="text-2xl font-semibold tracking-tight">
					{i18n.t('design.build')}
				</h2>
				<div class="mt-6 grid gap-6 md:grid-cols-3">
					<div>
						<h3 class="font-medium">{i18n.t('design.spec')}</h3>
						<p class="mt-2 text-sm text-muted-foreground">{i18n.t('design.spec_description')}</p>
						<a href="/design.md" class="mt-3 inline-block text-sm underline underline-offset-4"
							>DESIGN.md ↗</a
						>
					</div>
					<div>
						<h3 class="flex items-center gap-2 font-medium">
							<Command class="size-4" />{i18n.t('design.command')}
						</h3>
						<p class="mt-2 text-sm text-muted-foreground">{i18n.t('design.command_description')}</p>
					</div>
					<div>
						<h3 class="font-medium">{i18n.t('design.reuse')}</h3>
						<p class="mt-2 text-sm text-muted-foreground">{i18n.t('design.reuse_description')}</p>
					</div>
				</div>
			</section>
		</div>
		<aside class="sticky top-6 hidden 2xl:block">
			<DesignToc items={tocItems} />
		</aside>
	</div>
</div>
