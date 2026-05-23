<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { mode, setMode, resetMode } from 'mode-watcher';
	import {
		screensaver as screensaverStore,
		inactivityTimeout,
		backgroundTexture,
		backgroundSize,
		backgroundSpacing,
		theme as themeStore,
		DEFAULT_BACKGROUND_SIZE,
		DEFAULT_BACKGROUND_SPACING
	} from '$lib/stores/app';
	import { Check } from 'lucide-svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { type SuperForm, type Infer } from 'sveltekit-superforms';
	import { themes } from '$lib/utils/themes';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { backgroundTextures } from '$lib/config';
	import { Input } from '$lib/components/ui/input';
	import { formatDuration } from '$lib/utils/helper';
	import type { SettingsSchema } from './schema';

	let { form }: { form: SuperForm<Infer<SettingsSchema>> } = $props();

	function handleModeChange(value: string) {
		switch (value) {
			case 'light':
			case 'dark':
				setMode(value);
				break;
			default:
				resetMode();
		}
	}
</script>

<div class="flex flex-col space-y-6">
	<div class="flex flex-col md:flex-row gap-4 md:gap-10 ">
		<Form.Field {form} name="mode" class="flex flex-col justify-between gap-2">
			<Form.Control>
				{#snippet children({ props })}
					<div class="flex flex-col space-y-2">
						<h2>{i18n.t('settings.mode')}</h2>

						<RadioGroup.Root
							class="flex flex-row gap-4 space-y-1"
							value={$mode}
							onValueChange={handleModeChange}
							{...props}
						>
							<div class="flex items-center space-x-3 space-y-0">
								<RadioGroup.Item value="light" id="light" />
								<Form.Label for="light" class="font-normal" onclick={() => handleModeChange('light')}
									>{i18n.t('settings.light')}</Form.Label
								>
							</div>
							<div class="flex items-center space-x-3 space-y-0">
								<RadioGroup.Item value="dark" id="dark" />
								<Form.Label for="dark" class="font-normal" onclick={() => handleModeChange('dark')}
									>{i18n.t('settings.dark')}</Form.Label
								>
							</div>
							<div class="flex items-center space-x-3 space-y-0">
								<RadioGroup.Item value="" id="system" />
								<Form.Label for="system" class="font-normal" onclick={() => handleModeChange('')}
									>{i18n.t('settings.system')}</Form.Label
								>
							</div>
						</RadioGroup.Root>
					</div>
				{/snippet}
			</Form.Control>
		</Form.Field>

		<div class="flex flex-col gap-2">
			<h2>{i18n.t('settings.screensaver')}</h2>
			<div class="flex flex-row items-end gap-4">
				<Form.Field {form} name="screensaver" class="flex flex-col justify-between">
					<div class="flex items-center space-x-3 space-y-0 h-10">
						<Form.Control>
							{#snippet children({ props })}
								<Select.Root
									type="single"
									bind:value={$screensaverStore}
									name={props.name}
								>
									<Select.Trigger {...props} class="w-full min-w-40">
										{i18n.t(`settings.screensaver_${$screensaverStore}`)}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="none" label={i18n.t('settings.screensaver_none')} />
										<Select.Item value="dvd" label={i18n.t('settings.screensaver_dvd')} />
										<Select.Item value="playlists" label={i18n.t('settings.screensaver_playlists')} />
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
					</div>
				</Form.Field>

				{#if $screensaverStore !== 'none'}
					<Form.Field {form} name="inactivityTimeout" class="flex flex-col justify-between">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center gap-2">
									<Input
										type="number"
										class="w-20"
										bind:value={$inactivityTimeout}
										{...props}
										min="30"
										max="3600"
										step="30"
									/>
									<span class="text-sm text-muted-foreground"
										>{$inactivityTimeout >= 60 ? formatDuration($inactivityTimeout * 1000) : i18n.t('duration.s')}</span
									>
								</div>
							{/snippet}
						</Form.Control>
					</Form.Field>
				{/if}
			</div>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-2 md:grid-cols-3 pt-4">
		<h2 class="col-span-2 mt-0 sm:-mt-2 md:col-span-3">{i18n.t('settings.theme')}</h2>
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

	<div class="flex flex-col md:flex-row gap-8">
		<Form.Field {form} name="backgroundTexture" class="flex flex-col justify-between gap-2">
			<Form.Control>
				{#snippet children({ props })}
					<div class="flex flex-col space-y-4">
						<Form.Label class="text-base">{i18n.t('settings.texture')}</Form.Label>
						<Select.Root
							type="single"
							bind:value={$backgroundTexture}
							name={props.name}
							onValueChange={() => {
								$backgroundSize = DEFAULT_BACKGROUND_SIZE;
								$backgroundSpacing = DEFAULT_BACKGROUND_SPACING;
							}}
						>
							<Select.Trigger {...props} class="w-full min-w-56">
								{$backgroundTexture
									? i18n.t(`settings.${$backgroundTexture}`)
									: i18n.t('settings.texture')}
							</Select.Trigger>
							<Select.Content>
								{#each backgroundTextures as texture}
									<Select.Item value={texture.value} label={i18n.t(`settings.${texture.name}`)} />
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				{/snippet}
			</Form.Control>
		</Form.Field>

		{#if $backgroundTexture !== 'none'}
			<div class="flex gap-4">
				<Form.Field {form} name="backgroundSize" class="flex flex-col justify-between min-w-24">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label class="pt-2">{i18n.t('settings.texture_size')}</Form.Label>
							<Input
								type="number"
								class="w-20"
								bind:value={$backgroundSize}
								{...props}
								min="0.5"
								max="24"
								step="0.5"
							/>
						{/snippet}
					</Form.Control>
				</Form.Field>
				<Form.Field {form} name="backgroundSpacing" class="flex flex-col justify-between">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label class="pt-2">{i18n.t('settings.texture_spacing')}</Form.Label>
							<div class="flex items-center gap-2">
								<Input
									type="range"
									bind:value={$backgroundSpacing}
									{...props}
									min="4"
									max="64"
									step="1"
									class="h-10"
								/>
								<span class="w-8 text-right text-sm">{$backgroundSpacing}</span>
							</div>
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>
		{/if}
	</div>
</div>
