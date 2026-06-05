<script lang="ts">
	import { Heading } from '$lib/components/typography';
	import OGPreview from '$lib/components/OGPreview.svelte';
	import { backgroundTextures } from '$lib/config';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { Download, Copy, ExternalLink, RefreshCcw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import IconPicker from '$lib/components/IconPicker.svelte';

	let title = $state('muenstererOS');
	let name = $state('muenstererOS');
	let iconName = $state('Info');
	let iconSearch = $state('');
	let showFavicon = $state(false);
	let theme = $state<'light' | 'dark'>('dark');
	let texture = $state('dots');
	let size = $state(1);
	let spacing = $state(16);
	let width = $state(1200);
	let height = $state(630);

	const allIconNames = Object.keys(LucideIcons)
		.filter(
			(key) =>
				typeof (LucideIcons as any)[key] === 'function' ||
				typeof (LucideIcons as any)[key] === 'object'
		)
		.sort();

	const filteredIconNames = $derived(
		allIconNames.filter((name) => name.toLowerCase().includes(iconSearch.toLowerCase()))
	);

	const previewUrl = $derived.by(() => {
		const params = new URLSearchParams({
			title,
			name,
			icon: showFavicon ? 'favicon' : iconName,
			theme,
			texture,
			size: size.toString(),
			spacing: spacing.toString(),
			width: width.toString(),
			height: height.toString()
		});
		return `/og-preview?${params.toString()}`;
	});

	function copyUrl() {
		const fullUrl = window.location.origin + previewUrl;
		navigator.clipboard.writeText(fullUrl);
		toast.success('URL copied to clipboard');
	}

	async function downloadImage() {
		toast.info('To download, please use the "Open in New Tab" button and save the screenshot or use the generation script.');
	}

	function reset() {
		title = 'muenstererOS';
		name = 'muenstererOS';
		iconName = 'Info';
		iconSearch = '';
		showFavicon = false;
		theme = 'dark';
        texture = 'dots';
        size = 1;
        spacing = 16;
        width = 1200;
        height = 630;
    }
</script>

<svelte:head>
	<title>OG Image Builder{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<div class="container mx-auto max-w-6xl space-y-8 py-8">
	<div class="flex items-center justify-between">
		<Heading class="mb-0">OG Image Builder</Heading>
		<div class="flex gap-2">
            <Button variant="outline" size="icon" onclick={reset} title="Reset">
                <RefreshCcw class="h-4 w-4" />
            </Button>
			<Button variant="outline" onclick={copyUrl}>
				<Copy class="mr-2 h-4 w-4" />
				Copy URL
			</Button>
			<Button variant="outline" href={previewUrl} target="_blank">
				<ExternalLink class="mr-2 h-4 w-4" />
				Open Preview
			</Button>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Sidebar Controls -->
		<div class="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="title">Title Bar</Label>
					<Input id="title" bind:value={title} />
				</div>
				<div class="space-y-2">
					<Label for="name">Page Name</Label>
					<Input id="name" bind:value={name} />
				</div>
			</div>

			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<Label for="favicon-toggle">Use Favicon</Label>
					<Switch id="favicon-toggle" bind:checked={showFavicon} />
				</div>

				{#if !showFavicon}
					<div class="space-y-2">
						<Label for="icon">Icon Name</Label>
				    <IconPicker value={iconName} onSelect={(icon) => (iconName = icon)}
					</div>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="theme">Theme</Label>
					<Select.Root type="single" bind:value={theme}>
						<Select.Trigger>
							{theme === 'dark' ? 'Dark' : 'Light'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="dark">Dark</Select.Item>
							<Select.Item value="light">Light</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-2">
					<Label for="texture">Texture</Label>
					<Select.Root type="single" bind:value={texture}>
						<Select.Trigger>
							{texture}
						</Select.Trigger>
						<Select.Content>
							{#each backgroundTextures as tex}
								<Select.Item value={tex.value}>{tex.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="size">Texture Size ({size})</Label>
					<Input id="size" type="number" bind:value={size} min="0.1" step="0.1" />
				</div>
				<div class="space-y-2">
					<Label for="spacing">Spacing ({spacing})</Label>
					<Input id="spacing" type="number" bind:value={spacing} min="1" />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="width">Width</Label>
					<Input id="width" type="number" bind:value={width} />
				</div>
				<div class="space-y-2">
					<Label for="height">Height</Label>
					<Input id="height" type="number" bind:value={height} />
				</div>
			</div>

			<Button class="w-full" onclick={downloadImage}>
				<Download class="mr-2 h-4 w-4" />
				Download (Instructions)
			</Button>
		</div>

		<!-- Preview Area -->
		<div class="flex items-start justify-center lg:col-span-2">
			<div class="w-full overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
				<div class="flex flex-col items-center gap-4">
					<div class="w-full overflow-auto">
						<div
							class="mx-auto shadow-2xl"
							style="width: {width}px; height: {height}px; transform: scale({width > 800 ? 0.4 : 0.8}); transform-origin: top center;"
						>
							<OGPreview
								{title}
								{name}
								iconName={showFavicon ? 'favicon' : iconName}
								{theme}
								{texture}
								{size}
								{spacing}
								{width}
								{height}
							/>
						</div>
					</div>
					<p class="text-sm text-muted-foreground">
						Preview is scaled down (60%). Actual size: {width}x{height}px
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
