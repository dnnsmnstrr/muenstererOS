<script lang="ts">
	import { tick } from 'svelte';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { previewThemes, tokenStyle, themeCSS } from './themes';
	import CopyButton from './CopyButton.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { i18n } from '$lib/i18n/i18n.svelte';
	let selected = $state('zinc');
	let selectedToken = $state('');
	let themeList: HTMLElement | null = $state(null);
	$effect(() => {
		selected;
		tokenMode;
		selectedToken = '';
	});
	let tokenMode = $state<'light' | 'dark'>('light');
	const theme = $derived(previewThemes.find((item) => item.name === selected) ?? previewThemes[0]);

	async function selectTheme(name: string) {
		selected = name;
		await tick();
		themeList
			?.querySelector<HTMLElement>(`[data-theme-name="${name}"]`)
			?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
	}

	function cycleTheme(direction: -1 | 1) {
		const currentIndex = previewThemes.findIndex((item) => item.name === selected);
		const nextIndex = (currentIndex + direction + previewThemes.length) % previewThemes.length;
		void selectTheme(previewThemes[nextIndex].name);
	}
</script>

<section id="themes" class="scroll-mt-24 space-y-6" aria-labelledby="themes-title">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<p class="mb-2 font-mono text-xs text-muted-foreground">
				01 / {i18n.t('design.foundations')}
			</p>
			<h2 id="themes-title" class="text-2xl font-semibold tracking-tight">
				{i18n.t('design.themes')}
			</h2>
			<p class="mt-2 max-w-2xl text-sm text-muted-foreground">
				{i18n.t('design.theme_description')}
			</p>
		</div>
		<CopyButton text={themeCSS(theme)} label={i18n.t('design.copy_theme')} />
	</div>
	<div class="flex min-w-0 items-center gap-2" data-theme-selector>
		<Button
			variant="outline"
			size="icon"
			class="shrink-0"
			aria-label={i18n.t('design.previous_theme')}
			onclick={() => cycleTheme(-1)}
		>
			<ChevronLeft />
		</Button>
		<div
			bind:this={themeList}
			class="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			role="group"
			aria-label={i18n.t('design.themes')}
		>
			{#each previewThemes as item}
				<button
					data-theme-name={item.name}
					class="flex min-h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm capitalize transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
					class:bg-secondary={selected === item.name}
					aria-pressed={selected === item.name}
					onclick={() => void selectTheme(item.name)}
				>
					<span class="size-3 rounded-full border" style:background={`hsl(${item.light.primary})`}
					></span>{item.name}
				</button>
			{/each}
		</div>
		<Button
			variant="outline"
			size="icon"
			class="shrink-0"
			aria-label={i18n.t('design.next_theme')}
			onclick={() => cycleTheme(1)}
		>
			<ChevronRight />
		</Button>
	</div>
	<div class="grid gap-4 md:grid-cols-2">
		{#each ['light', 'dark'] as mode}
			<div
				data-theme-preview={mode}
				style={tokenStyle(theme[mode as 'light' | 'dark'])}
				class="rounded-xl border bg-background p-6 text-foreground"
			>
				<div class="mb-8 flex items-center justify-between">
					<span class="font-mono text-xs uppercase tracking-widest"
						>{theme.name} / {i18n.t('design.' + mode)}</span
					><Badge variant="secondary">{i18n.t('design.preview')}</Badge>
				</div>
				<h3 class="text-2xl font-semibold tracking-tight">{i18n.t('design.demo.project')}</h3>
				<p class="mb-5 mt-2 text-sm text-muted-foreground">{i18n.t('design.demo.description')}</p>
				<Input
					aria-label={i18n.t('design.demo.name') + ' / ' + mode}
					placeholder={i18n.t('design.demo.name')}
					class="mb-4"
				/>
				<div class="flex flex-wrap gap-2">
					<Button>{i18n.t('design.demo.save')}</Button><Button variant="outline"
						>{i18n.t('design.demo.details')}</Button
					><Button variant="destructive">{i18n.t('design.demo.delete')}</Button>
				</div>
				<div class="mt-6 flex h-8 overflow-hidden rounded-md border" aria-hidden="true">
					{#each ['primary', 'secondary', 'muted', 'accent', 'border', 'destructive'] as token}<span
							class="flex-1"
							style:background={`hsl(var(--${token}))`}
						></span>{/each}
				</div>
			</div>
		{/each}
	</div>
	<div class="rounded-lg border">
		<div class="flex flex-wrap items-center justify-between gap-3 border-b p-4">
			<h3 class="font-medium">{i18n.t('design.tokens')}</h3>
			<div class="flex gap-1" role="group" aria-label={i18n.t('design.token_mode')}>
				{#each ['light', 'dark'] as mode}<Button
						size="sm"
						variant={tokenMode === mode ? 'secondary' : 'ghost'}
						aria-pressed={tokenMode === mode}
						onclick={() => (tokenMode = mode as 'light' | 'dark')}
						>{i18n.t('design.' + mode)}</Button
					>{/each}
			</div>
		</div>
		<div class="grid sm:grid-cols-2 xl:grid-cols-3">
			{#each Object.entries(theme[tokenMode]) as [name, value]}
				<button
					class="flex min-w-0 items-center gap-3 border-b p-4 text-left hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
					onclick={() => {
						selectedToken = `--${name}: ${value};`;
					}}
					aria-label={i18n.t('design.inspect') + ' --' + name}
				>
					<span
						class="size-10 shrink-0 border"
						style:background={name === 'radius' ? 'transparent' : `hsl(${value})`}
						style:border-radius={name === 'radius' ? value : '6px'}
					></span><span class="min-w-0"
						><span class="block break-all font-mono text-xs">--{name}</span><span
							class="mt-1 block font-mono text-xs text-muted-foreground">{value}</span
						></span
					>
				</button>
			{/each}
		</div>
		<div class="flex flex-wrap items-center justify-between gap-3 p-4">
			<code class="break-all text-xs" aria-live="polite"
				>{selectedToken || i18n.t('design.select_token')}</code
			>{#if selectedToken}<CopyButton
					text={selectedToken}
					label={i18n.t('design.copy_token')}
				/>{/if}
		</div>
	</div>
	<details class="rounded-lg border p-4">
		<summary class="cursor-pointer text-sm font-medium">{i18n.t('design.theme_source')}</summary>
		<pre class="mt-4 max-h-80 overflow-auto text-xs"><code>{themeCSS(theme)}</code></pre>
	</details>
</section>
