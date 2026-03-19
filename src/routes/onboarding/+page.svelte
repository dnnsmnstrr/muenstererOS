<script lang="ts">
	import * as Stepper from '$lib/components/ui/stepper';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { theme as themeStore, backgroundTexture } from '$lib/stores/app';
	import { themes } from '$lib/utils/themes';
	import { mode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Check, Languages, Palette, Layout, PartyPopper } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { PAGE_TITLE_SUFFIX, backgroundTextures } from '$lib/config';
	import { browser } from '$app/environment';

	let step = $state(1);

	const steps = [
		{
			id: 'welcome',
			title: i18n.t('onboarding.step_welcome'),
			icon: PartyPopper
		},
		{
			id: 'language',
			title: i18n.t('onboarding.step_language'),
			icon: Languages
		},
		{
			id: 'theme',
			title: i18n.t('onboarding.step_theme'),
			icon: Palette
		},
		{
			id: 'texture',
			title: i18n.t('onboarding.step_texture'),
			icon: Layout
		}
	];

	function finish() {
		if (browser) {
			localStorage.setItem('onboardingComplete', 'true');
		}
		goto('/');
	}
</script>

<svelte:head>
	<title>{i18n.t('onboarding.title')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-2xl flex-col gap-8 py-10">
	<div class="space-y-2 text-center">
		<h1 class="text-3xl font-bold">{i18n.t('onboarding.title')}</h1>
		<p class="text-muted-foreground">{i18n.t('onboarding.description')}</p>
	</div>

	<Stepper.Root bind:step>
		<Stepper.Nav class="px-4 justify-between">
			{#each steps as item, i (item.id)}
				<Stepper.Item>
					<Stepper.Trigger class="flex flex-col items-center z-10">
						<Stepper.Indicator>
							<item.icon class="size-4" />
						</Stepper.Indicator>
						<Stepper.Title class="hidden sm:block">{item.title}</Stepper.Title>
					</Stepper.Trigger>
					<Stepper.Separator class="sm:left-[calc(40px)] lg:left-[calc(40px)]" />
				</Stepper.Item>
			{/each}
		</Stepper.Nav>

		<div
			class="mt-4 flex min-h-[300px] items-center justify-center rounded-xl border bg-card p-8 shadow-sm flex-col"
		>
			{#if step === 1}
				<div class="flex flex-col items-center justify-center space-y-4 text-center">
					<PartyPopper class="size-16 text-primary" />
					<p class="max-w-md text-lg">
						{i18n.t('onboarding.welcome')}
					</p>
				</div>
			{:else if step === 2}
				<div class="flex flex-col items-center space-y-6">
					<h2 class="text-xl font-semibold">{i18n.t('settings.language')}</h2>
					<RadioGroup.Root
						class="grid w-full max-w-xs grid-cols-2 gap-4"
						value={i18n.lang}
						onValueChange={(v) => i18n.setLanguage(v as any)}
					>
						<label
							for="en"
							class={cn(
								'flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground',
								i18n.lang === 'en' && 'border-primary'
							)}
						>
							<RadioGroup.Item value="en" id="en" class="sr-only" />
							<span class="text-2xl">🇺🇸</span>
							<span class="font-medium">{i18n.t('settings.english')}</span>
						</label>
						<label
							for="de"
							class={cn(
								'flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground',
								i18n.lang === 'de' && 'border-primary'
							)}
						>
							<RadioGroup.Item value="de" id="de" class="sr-only" />
							<span class="text-2xl">🇩🇪</span>
							<span class="font-medium">{i18n.t('settings.german')}</span>
						</label>
					</RadioGroup.Root>
				</div>
			{:else if step === 3}
				<div class="flex flex-col items-center space-y-6">
					<h2 class="text-xl font-semibold">{i18n.t('settings.theme')}</h2>
					<div class="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
						{#each themes as theme (theme.name)}
							{@const isActive = $themeStore === theme.name}
							<Button
								variant="outline"
								size="sm"
								onclick={() => {
									$themeStore = theme.name;
								}}
								class={cn('justify-start truncate', isActive && 'border-2 border-primary')}
								style="--theme-primary: hsl({theme.activeColor[$mode ?? 'dark']})"
							>
								<span
									class="mr-1 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full bg-[--theme-primary]"
								>
									{#if isActive}
										<Check class="h-4 w-4 text-white" />
									{/if}
								</span>
								{i18n.t(`settings.themes.${theme.name}`)}
							</Button>
						{/each}
					</div>
				</div>
			{:else if step === 4}
				<div class="flex flex-col items-center space-y-6 w-full">
					<h2 class="text-xl font-semibold">{i18n.t('settings.texture')}</h2>
					<div class="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
						{#each backgroundTextures as texture}
							{@const isActive = $backgroundTexture === texture.value}
							<button
								onclick={() => ($backgroundTexture = texture.value)}
								class={cn(
									'flex flex-col items-center gap-2 rounded-lg border-2 p-2 transition-all hover:bg-accent w-full',
									isActive ? 'border-primary bg-accent' : 'border-muted'
								)}
							>
								<div
									class="h-20 w-full rounded-md border bg-card"
									style={texture.getStyle($mode === 'light' ? '#e5e5e5' : '#222222')}
								></div>
								<span class="text-sm font-medium">{i18n.t(`settings.${texture.name}`)}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<div class="mt-8 flex justify-between gap-4">
				<Stepper.Previous variant="outline" class="min-w-24">
					{i18n.t('playlists.previous')}
				</Stepper.Previous>
				{#if step < steps.length}
					<Stepper.Next class="min-w-24">
						{i18n.t('playlists.next')}
					</Stepper.Next>
				{:else}
					<Button size="sm" onclick={finish} style="min-w-24">
						{i18n.t('onboarding.finish')}
					</Button>
				{/if}
			</div>
		</div>
	</Stepper.Root>
</div>
