<script lang="ts" module>
	import { formatDuration } from '$lib/utils/helper';
	import { z } from 'zod';
	export const settingsSchema = z.object({
		debug: z.boolean().default(false),
		mode: z.string().default('system'),
		language: z.string().default('en'),
		dvdBounceEnabled: z.boolean().default(false),
		backgroundTexture: z.string().default('dots'),
		backgroundSize: z.number().default(1),
		backgroundSpacing: z.number().default(16)
	});
	export type SettingsSchema = typeof settingsSchema;
</script>

<script lang="ts">
	import { get } from 'svelte/store';
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { mode, setMode, resetMode } from 'mode-watcher';
	import {
		debug,
		dvdBounceEnabled,
		backgroundTexture,
		backgroundSize,
		backgroundSpacing,
		theme as themeStore
	} from '$lib/stores/app';
	import { Bug, Check } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import AnimatedToggle from '$lib/components/AnimatedToggle.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { themes } from '$lib/utils/themes';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { INACTIVITY_TIMEOUT, backgroundTextures } from '$lib/config';
	import { Input } from '$lib/components/ui/input';

	let { data }: { data?: { form?: SuperValidated<Infer<SettingsSchema>> } } = $props();
	const form = superForm(
		data?.form || {
			debug: false,
			mode: 'system',
			language: i18n.lang,
			dvdBounceEnabled: false,
			backgroundTexture: get(backgroundTexture),
			backgroundSize: get(backgroundSize),
			backgroundSpacing: get(backgroundSpacing)
		},
		{
			validators: zodClient(settingsSchema)
		}
	);
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

<form>
	<div class="grid gap-6 md:grid-cols-2">
		<Form.Field {form} name="language" class="flex flex-col justify-between gap-2">
			<Form.Control>
				{#snippet children({ props })}
					<div class="flex flex-col space-y-2">
						<h2>{i18n.t('settings.language')}</h2>
						<RadioGroup.Root
							class="flex flex-col space-y-1"
							value={i18n.lang}
							onValueChange={(v) => i18n.setLanguage(v as any)}
							{...props}
						>
							<div class="flex items-center space-x-3 space-y-0">
								<RadioGroup.Item value="en" id="en" />
								<Form.Label for="en" class="font-normal">{i18n.t('settings.english')}</Form.Label>
							</div>
							<div class="flex items-center space-x-3 space-y-0">
								<RadioGroup.Item value="de" id="de" />
								<Form.Label for="de" class="font-normal">{i18n.t('settings.german')}</Form.Label>
							</div>
						</RadioGroup.Root>
					</div>
				{/snippet}
			</Form.Control>
		</Form.Field>

		<Form.Field {form} name="debug">
			<Form.Control>
				<div class="flex flex-row items-start space-x-3 space-y-0 pt-3">
					<Checkbox
						checked={$debug}
						onCheckedChange={(value) => ($debug = !!value)}
						id="debug-checkbox"
					/>
					<div class="space-y-1 leading-none">
						<Form.Label
							class="-mt-0.5 flex items-center gap-2"
							for="debug-checkbox"
							onclick={() => ($debug = !$debug)}
						>
							<span class="pb-1.5">{i18n.t('settings.debug_mode')}</span>
							<AnimatedToggle visible={$debug}>
								<Bug class="w-4" />
							</AnimatedToggle>
						</Form.Label>
					</div>
				</div>
				<Form.Description>{i18n.t('settings.debug_description')}</Form.Description>
			</Form.Control>
		</Form.Field>
	</div>

	<Separator class="my-6" />

	<Form.Field {form} name="mode" class="flex flex-col justify-between gap-2 sm:flex-row">
		<div class="flex flex-col space-y-6">
			<Form.Control>
				{#snippet children({ props })}
					<div class="flex flex-col space-y-2">
						<h2>{i18n.t('settings.mode')}</h2>
						<RadioGroup.Root
							class="flex flex-col space-y-1"
							value={$mode}
							onValueChange={handleModeChange}
							{...props}
						>
							<div class="flex items-center space-x-3 space-y-0">
								<RadioGroup.Item value="light" id="light" />
								<Form.Label for="light" class="font-normal">{i18n.t('settings.light')}</Form.Label>
							</div>
							<div class="flex items-center space-x-3 space-y-0">
								<RadioGroup.Item value="dark" id="dark" />
								<Form.Label for="dark" class="font-normal">{i18n.t('settings.dark')}</Form.Label>
							</div>
							<div class="flex items-center space-x-3 space-y-0">
								<RadioGroup.Item value="" id="system" />
								<Form.Label for="system" class="font-normal">{i18n.t('settings.system')}</Form.Label
								>
							</div>
						</RadioGroup.Root>
					</div>
				{/snippet}
			</Form.Control>

			<Form.Field {form} name="dvdBounceEnabled" class="flex flex-col justify-between gap-2">
				<div class="flex flex-col space-y-2">
					<h2>{i18n.t('settings.dvd_bounce')}</h2>
					<div class="flex items-center space-x-3 space-y-0">
						<Form.Control>
							{#snippet children({ props })}
								<Checkbox
									{...props}
									checked={$dvdBounceEnabled}
									onCheckedChange={(value) => ($dvdBounceEnabled = !!value)}
									id="dvd-bounce-checkbox"
								/>
								<Form.Label
									for="dvd-bounce-checkbox"
									class="font-normal"
									title={formatDuration(INACTIVITY_TIMEOUT)}
									onclick={() => ($dvdBounceEnabled = !$dvdBounceEnabled)}
								>
									{i18n.t('settings.enable_dvd_bounce')}
								</Form.Label>
							{/snippet}
						</Form.Control>
					</div>
				</div>
			</Form.Field>

			<div class="flex flex-col space-y-2">
				<Form.Field {form} name="backgroundTexture" class="flex flex-col justify-between gap-2">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex flex-col space-y-2">
								<Form.Label>{i18n.t('settings.texture')}</Form.Label>
								<Select.Root type="single" bind:value={$backgroundTexture} name={props.name}>
									<Select.Trigger {...props} class="w-full">
										{$backgroundTexture
											? i18n.t(`settings.${$backgroundTexture}`)
											: i18n.t('settings.texture')}
									</Select.Trigger>
									<Select.Content>
										{#each backgroundTextures as texture}
											<Select.Item
												value={texture.value}
												label={i18n.t(`settings.${texture.name}`)}
											/>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
						{/snippet}
					</Form.Control>
				</Form.Field>

				{#if $backgroundTexture !== 'none'}
					<div class="grid grid-cols-2 gap-4">
						<Form.Field {form} name="backgroundSize" class="flex flex-col justify-between gap-2">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>{i18n.t('settings.texture_size')}</Form.Label>
									<Input
										type="number"
										bind:value={$backgroundSize}
										{...props}
										min="1"
										max="20"
										step="1"
									/>
								{/snippet}
							</Form.Control>
						</Form.Field>
						<Form.Field {form} name="backgroundSpacing" class="flex flex-col justify-between gap-2">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>{i18n.t('settings.texture_spacing')}</Form.Label>
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

		<div class="grid grid-cols-2 gap-2 md:grid-cols-3">
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
	</Form.Field>

	<Separator class="mt-6" />
</form>
