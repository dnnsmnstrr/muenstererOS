<script lang="ts">
	import { Heading, Kbd, Link } from '$lib/components/typography';
	import { i18n } from '$lib/i18n/i18n.svelte';
</script>

<div class="w-full space-y-8">
	<div class="space-y-2">
		<p class="font-mono text-xs uppercase tracking-widest text-muted-foreground">Display / 48</p>
		<p class="text-4xl font-bold leading-none tracking-tight sm:text-5xl">
			{i18n.t('design.demo.typography_title')}
		</p>
	</div>
	<div class="space-y-2">
		<p class="font-mono text-xs uppercase tracking-widest text-muted-foreground">Heading / 36</p>
		<Heading depth={2} class="border-0 pb-0">{i18n.t('design.demo.typography_heading')}</Heading>
	</div>
	<div class="space-y-2">
		<p class="font-mono text-xs uppercase tracking-widest text-muted-foreground">Body / 16</p>
		<p class="max-w-2xl leading-relaxed">{i18n.t('design.demo.typography_body')}</p>
		<p class="text-sm text-muted-foreground">{i18n.t('design.demo.typography_muted')}</p>
	</div>
	<div class="flex flex-wrap items-center gap-4">
		<Link href="/design.md">{i18n.t('design.spec')}</Link>
		<span class="text-sm text-muted-foreground">{i18n.t('design.demo.press')} <Kbd>⌘ K</Kbd></span>
		<code class="rounded bg-muted px-2 py-1 font-mono text-sm">--foreground</code>
	</div>
</div>
