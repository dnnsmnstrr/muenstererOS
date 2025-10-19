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
	import { mode, setMode, resetMode } from 'mode-watcher';
	import { debug, theme as themeStore } from '$lib/stores/app';
	import { Bug, Check } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import AnimatedToggle from '$lib/components/AnimatedToggle.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { themes } from '$lib/utils/themes';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

  let { data }: { data?: { form?: SuperValidated<Infer<SettingsSchema>> } } =
    $props();
	const form = superForm(data?.form || { debug: false, mode: 'system'}, {
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
	<Form.Field {form} name="mode" class="flex flex-col sm:flex-row justify-between gap-2">
		<Form.Control>
			<div class="flex flex-col space-y-2">
				<h2>Mode</h2>
				<RadioGroup.Root class="flex flex-col space-y-1" value={$mode} onValueChange={handleModeChange}>
				  <div class="flex items-center space-x-3 space-y-0">
					<RadioGroup.Item value="light" id="light" />
					<Form.Label for="light" class="font-normal">Light</Form.Label>
				  </div>
				  <div class="flex items-center space-x-3 space-y-0">
					<RadioGroup.Item value="dark" id="dark" />
					<Form.Label for="dark" class="font-normal">Dark</Form.Label>
				  </div>
				  <div class="flex items-center space-x-3 space-y-0">
					<RadioGroup.Item value="" id="system" />
					<Form.Label for="system" class="font-normal">System</Form.Label>
				  </div>
				</RadioGroup.Root>
			</div>
		</Form.Control>
		<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
			<h2 class="col-span-2 md:col-span-3 -mt-2">Theme</h2>
			{#each themes as theme (theme.name)}
				{@const isActive = $themeStore === theme.name}
				<Button
					variant="outline"
					size="sm"
					onclick={() => {
						$themeStore = theme.name;
					}}
					class={cn("justify-start truncate", isActive && "border-primary border-2")}
					style="--theme-primary: hsl({theme.activeColor[$mode ?? 'dark']})"
				>
					<span
						class="mr-1 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full bg-[--theme-primary]"
					>
						{#if isActive}
							<Check class="h-4 w-4 text-white" />
						{/if}
					</span>
					{theme.label}
				</Button>
			{/each}
		</div>
	</Form.Field>
	<Separator class="my-6"/>
	
	<Form.Field {form} name="debug">
    <Form.Control>
      <div class="flex flex-row items-start space-x-3 space-y-0">
        <Checkbox checked={$debug} onCheckedChange={(value) => ($debug = !!value)} id="debug-checkbox" />
        <div class="space-y-1 leading-none">
          <Form.Label class="-mt-0.5 flex items-center gap-2" for="debug-checkbox" onclick={() => ($debug = !$debug)}>
            <span class="pb-1.5">Debug mode</span>
            <AnimatedToggle visible={$debug}>
              <Bug class="w-4" />
            </AnimatedToggle>
          </Form.Label>
          <Form.Description>This will cause more verbose logging in the console.</Form.Description>
        </div>
      </div>
    </Form.Control>
	</Form.Field>
</form>
