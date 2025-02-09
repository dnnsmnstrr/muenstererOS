<script lang="ts" module>
	import { z } from 'zod';
	export const settingsSchema = z.object({
		debug: z.boolean().default(false),
		mode: z.string().default('system')
	});
	export type SettingsSchema = typeof settingsSchema;
</script>

<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Label } from '$lib/components/ui/label';
	import { mode, setMode, resetMode } from 'mode-watcher';
	import { debug } from '$lib/stores/app';
	import { Bug } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import AnimatedToggle from '$lib/components/AnimatedToggle.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

  let { data }: { data: { form: SuperValidated<Infer<SettingsSchema>> } } =
    $props();
	const form = superForm(data.form, {
		validators: zodClient(settingsSchema)
	});
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
	<Form.Field {form} name="mode">
		<Form.Control>
			<Form.Label>Theme Mode</Form.Label>
			<RadioGroup.Root class="flex flex-col space-y-1" value={$mode} onValueChange={handleModeChange}>
				<div class="flex items-center space-x-3 space-y-0">
					<RadioGroup.Item value="light" id="light" />
					<Label for="light" class="font-normal">Light</Label>
				</div>
				<div class="flex items-center space-x-3 space-y-0">
					<RadioGroup.Item value="dark" id="dark" />
					<Label for="dark" class="font-normal">Dark</Label>
				</div>
				<div class="flex items-center space-x-3 space-y-0">
					<RadioGroup.Item value="" id="system" />
					<Label for="system" class="font-normal">System</Label>
				</div>
			</RadioGroup.Root>
		</Form.Control>
	</Form.Field>
	<Separator />
	<Form.Field {form} name="debug">
		<div class="flex flex-row items-start space-x-3 space-y-0 pt-6">
			<Checkbox checked={$debug} onCheckedChange={(value) => ($debug = !!value)} />
			<div class="space-y-1 leading-none">
				<Form.Label class="-mt-0.5 flex items-center gap-2">
					<span class="pb-1.5">Debug mode</span>
					<AnimatedToggle visible={$debug}>
						<Bug class="w-4" />
					</AnimatedToggle>
				</Form.Label>
				<Form.Description>This will cause more verbose logging in the console.</Form.Description>
			</div>
		</div>
	</Form.Field>
</form>
