<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { debug } from '$lib/stores/app';
	import { Bug } from 'lucide-svelte';
	import AnimatedToggle from '$lib/components/AnimatedToggle.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { type SuperForm, type Infer } from 'sveltekit-superforms';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import type { SettingsSchema } from './schema';
	import { suggestionsLimit } from '$lib/stores/app';
	import * as Select from '$lib/components/ui/select';

	let { form }: { form: SuperForm<Infer<SettingsSchema>> } = $props();

	const suggestionsLimitOptions = $derived(
		[0, 3, 5, 10, 15, 20].map((v) => ({
			value: v,
			label: v === 0 ? i18n.t('settings.none') : v.toString()
		}))
	);
</script>

<div class="grid gap-6">
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

	<Form.Field {form} name="suggestionsLimit" class="flex flex-col justify-between gap-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{i18n.t('settings.suggestions_limit')}</Form.Label>
				<Select.Root
					type="single"
					value={$suggestionsLimit.toString()}
					onValueChange={(v) => {
						if (v) $suggestionsLimit = parseInt(v);
					}}
				>
					<Select.Trigger {...props}>
						{$suggestionsLimit === 0
							? i18n.t('settings.none')
							: $suggestionsLimit.toString()}
					</Select.Trigger>
					<Select.Content>
						{#each suggestionsLimitOptions as option}
							<Select.Item value={option.value.toString()} label={option.label} />
						{/each}
					</Select.Content>
				</Select.Root>
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
