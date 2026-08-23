<script lang="ts">
	import { Heading } from '$lib/components/typography';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { Switch } from '$lib/components/ui/switch';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { toast } from 'svelte-sonner';
	import { Copy, Dices, Download, RotateCcw } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import {
		allMarks,
		defaultConfig,
		getTemplate,
		renderSvg,
		templates,
		type MarkId,
		type MicroConfig,
		type TemplateId
	} from './micrographics';

	let config = $state<MicroConfig>({ ...defaultConfig, marks: [...defaultConfig.marks] });

	const svg = $derived(renderSvg(config));
	const template = $derived(getTemplate(config.template));

	function toggleMark(id: MarkId) {
		config.marks = config.marks.includes(id)
			? config.marks.filter((m) => m !== id)
			: [...config.marks, id];
	}

	function setTemplate(id: TemplateId) {
		config.template = id;
	}

	function shuffle() {
		config.seed = Math.floor(Math.random() * 9999);
	}

	function reset() {
		config = { ...defaultConfig, marks: [...defaultConfig.marks] };
	}

	function fileName(extension: string) {
		const slug = config.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
		return `${slug || 'micrographic'}-${config.seed}.${extension}`;
	}

	function download(href: string, name: string) {
		const link = document.createElement('a');
		link.href = href;
		link.download = name;
		link.click();
	}

	function downloadSvg() {
		const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
		download(url, fileName('svg'));
		URL.revokeObjectURL(url);
		toast.success(i18n.t('micro.toast_svg'));
	}

	async function copySvg() {
		try {
			await navigator.clipboard.writeText(svg);
			toast.success(i18n.t('micro.toast_copied'));
		} catch {
			toast.error(i18n.t('micro.toast_copy_failed'));
		}
	}

	function downloadPng() {
		const scale = 2;
		const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
		const image = new Image();
		image.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = template.width * scale;
			canvas.height = template.height * scale;
			const context = canvas.getContext('2d');
			if (!context) return;
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			URL.revokeObjectURL(url);
			download(canvas.toDataURL('image/png'), fileName('png'));
			toast.success(i18n.t('micro.toast_png'));
		};
		image.onerror = () => {
			URL.revokeObjectURL(url);
			toast.error(i18n.t('micro.toast_png_failed'));
		};
		image.src = url;
	}
</script>

<svelte:head>
	<title>{i18n.t('micro.title') + PAGE_TITLE_SUFFIX}</title>
	<meta name="description" content={i18n.t('micro.description')} />
</svelte:head>

<div class="container pb-10">
	<div class="mb-6">
		<Heading class="mb-2">{i18n.t('micro.title')}</Heading>
		<p class="text-muted-foreground max-w-2xl">{i18n.t('micro.description')}</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-[1fr_360px]">
		<Card.Root class="overflow-hidden">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between pb-3 font-mono text-xs text-muted-foreground">
					<span>{template.label} · {template.width}×{template.height}</span>
					<span>seed {config.seed}</span>
				</div>
				<div class="flex items-center justify-center rounded-md border bg-muted/30 p-3">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<div class="w-full max-w-full [&>svg]:h-auto [&>svg]:w-full">{@html svg}</div>
				</div>
				<div class="flex flex-wrap gap-2 pt-4">
					<Button onclick={downloadSvg}>
						<Download class="mr-2 h-4 w-4" />
						{i18n.t('micro.export_svg')}
					</Button>
					<Button variant="secondary" onclick={downloadPng}>
						<Download class="mr-2 h-4 w-4" />
						{i18n.t('micro.export_png')}
					</Button>
					<Button variant="outline" onclick={copySvg}>
						<Copy class="mr-2 h-4 w-4" />
						{i18n.t('micro.copy_svg')}
					</Button>
					<Button variant="outline" onclick={shuffle}>
						<Dices class="mr-2 h-4 w-4" />
						{i18n.t('micro.shuffle')}
					</Button>
					<Button variant="ghost" onclick={reset}>
						<RotateCcw class="mr-2 h-4 w-4" />
						{i18n.t('micro.reset')}
					</Button>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="p-4">
				<Tabs.Root value="template">
					<Tabs.List class="grid w-full grid-cols-4">
						<Tabs.Trigger value="template">{i18n.t('micro.tabs.template')}</Tabs.Trigger>
						<Tabs.Trigger value="marks">{i18n.t('micro.tabs.marks')}</Tabs.Trigger>
						<Tabs.Trigger value="text">{i18n.t('micro.tabs.text')}</Tabs.Trigger>
						<Tabs.Trigger value="style">{i18n.t('micro.tabs.style')}</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="template" class="space-y-4 pt-4">
						<div class="grid grid-cols-2 gap-2">
							{#each templates as item}
								<Button
									variant={config.template === item.id ? 'default' : 'outline'}
									class="justify-start font-mono text-xs"
									onclick={() => setTemplate(item.id)}
								>
									{i18n.t('micro.templates.' + item.id)}
								</Button>
							{/each}
						</div>
						<div class="space-y-2">
							<Label for="micro-seed">{i18n.t('micro.seed')}</Label>
							<Input id="micro-seed" type="number" bind:value={config.seed} min={0} max={99999} />
						</div>
						<div class="space-y-2">
							<Label>{i18n.t('micro.density')} · {config.density}</Label>
							<Slider type="single" bind:value={config.density} min={2} max={14} step={1} />
						</div>
					</Tabs.Content>

					<Tabs.Content value="marks" class="space-y-4 pt-4">
						<div class="grid grid-cols-2 gap-2">
							{#each allMarks as item}
								<Button
									variant={config.marks.includes(item) ? 'default' : 'outline'}
									class="justify-start font-mono text-xs"
									onclick={() => toggleMark(item)}
								>
									{i18n.t('micro.marks.' + item)}
								</Button>
							{/each}
						</div>
						<div class="space-y-2">
							<Label>{i18n.t('micro.stroke')} · {config.strokeWidth.toFixed(1)}</Label>
							<Slider type="single" bind:value={config.strokeWidth} min={0.5} max={3} step={0.1} />
						</div>
						<div class="flex items-center justify-between">
							<Label for="micro-labels">{i18n.t('micro.show_labels')}</Label>
							<Switch id="micro-labels" bind:checked={config.showLabels} />
						</div>
						<div class="flex items-center justify-between">
							<Label for="micro-grid">{i18n.t('micro.show_grid')}</Label>
							<Switch id="micro-grid" bind:checked={config.showGrid} />
						</div>
					</Tabs.Content>

					<Tabs.Content value="text" class="space-y-4 pt-4">
						<div class="space-y-2">
							<Label for="micro-title">{i18n.t('micro.field_title')}</Label>
							<Input id="micro-title" bind:value={config.title} />
						</div>
						<div class="space-y-2">
							<Label for="micro-subtitle">{i18n.t('micro.field_subtitle')}</Label>
							<Input id="micro-subtitle" bind:value={config.subtitle} />
						</div>
						<div class="space-y-2">
							<Label for="micro-code">{i18n.t('micro.field_code')}</Label>
							<Input id="micro-code" bind:value={config.code} />
						</div>
						<div class="space-y-2">
							<Label for="micro-footer">{i18n.t('micro.field_footer')}</Label>
							<Input id="micro-footer" bind:value={config.footer} />
						</div>
					</Tabs.Content>

					<Tabs.Content value="style" class="space-y-4 pt-4">
						<div class="space-y-2">
							<Label for="micro-bg">{i18n.t('micro.background')}</Label>
							<Input id="micro-bg" type="color" class="h-10 p-1" bind:value={config.background} />
						</div>
						<div class="space-y-2">
							<Label for="micro-ink">{i18n.t('micro.ink')}</Label>
							<Input id="micro-ink" type="color" class="h-10 p-1" bind:value={config.ink} />
						</div>
						<div class="space-y-2">
							<Label for="micro-accent">{i18n.t('micro.accent')}</Label>
							<Input id="micro-accent" type="color" class="h-10 p-1" bind:value={config.accent} />
						</div>
						<div class="space-y-2">
							<Label>{i18n.t('micro.accent_ratio')} · {Math.round(config.accentRatio * 100)}%</Label>
							<Slider type="single" bind:value={config.accentRatio} min={0} max={0.6} step={0.02} />
						</div>
					</Tabs.Content>
				</Tabs.Root>
			</Card.Content>
		</Card.Root>
	</div>
</div>
