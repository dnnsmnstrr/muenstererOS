<script lang="ts">
	import { MdSvelte } from '@jazzymcjazz/mdsvelte';
	import { renderers } from '$lib/components/typography';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import SafeHtml from '$lib/components/design/SafeHtml.svelte';

	const markdownRenderers = { ...renderers, html: SafeHtml };

	let source = $state(`# A small document

Markdown keeps content **portable** while shared renderers keep it at home in the system.

> Quiet structure leaves room for the work.

- Semantic headings
- Familiar links
- Reusable code blocks

\`\`\`ts
const ready = true;
\`\`\``);
</script>

<div class="grid w-full gap-4 xl:grid-cols-2">
	<div class="space-y-2">
		<Label for="design-markdown-source">{i18n.t('design.markdown_source')}</Label>
		<Textarea
			id="design-markdown-source"
			bind:value={source}
			class="min-h-80 resize-y font-mono text-sm"
		/>
	</div>
	<div class="space-y-2">
		<p class="text-sm font-medium">{i18n.t('design.markdown_preview')}</p>
		<div class="prose dark:prose-invert min-h-80 rounded-md border bg-background p-5">
			<MdSvelte {source} renderers={markdownRenderers} />
		</div>
	</div>
</div>
