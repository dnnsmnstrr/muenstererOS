<script lang="ts">
	import { Link } from '$lib/components/typography';
	import Heading from '$lib/components/typography/Heading.svelte';
	import * as Card from '$lib/components/ui/card';
	import GeneralSettings from './GeneralSettings.svelte';
	import AppearanceSettings from './AppearanceSettings.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Download, RotateCcw } from 'lucide-svelte';
	import { resetDesktopFiles } from '$lib/stores/desktop';
	import { toast } from 'svelte-sonner';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { settingsSchema } from './schema';
	import { get } from 'svelte/store';
	import { backgroundTexture, backgroundSize, backgroundSpacing } from '$lib/stores/app';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { SettingsSchema } from './schema';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let { data }: { data: { form?: SuperValidated<Infer<SettingsSchema>> } } = $props();

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
</script>

<div class="container mb-40">
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
		<div class="flex h-full flex-col gap-6">
			<Card.Root class="h-full">
				<Card.Header>
					<Card.Title class="flex w-full items-center justify-between">
						<Heading class="mb-0">{i18n.t('settings.title')}</Heading>
						<Link
							href="/admin"
							class="text-base text-muted-foreground no-underline lg:hidden"
							showIcon>{i18n.t('common.admin')}</Link
						>
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<GeneralSettings {form} />
					<Separator class="mt-6" />
				</Card.Content>
				<Card.Footer
					class="flex flex-col items-start justify-end gap-4"
				>
					<Button
						variant="outline"
						size="sm"
						class="w-full"
						onclick={() => {
							resetDesktopFiles();
							toast.success(i18n.t('settings.reset_success'));
						}}
					>
						<RotateCcw class="mr-2 h-4 w-4" />
						{i18n.t('settings.reset_desktop')}
					</Button>
					<Button variant="outline" size="sm" class="w-full" href="/export">
						<Download class="mr-2 h-4 w-4" />
						{i18n.t('command.export_data')}
					</Button>
				</Card.Footer>
			</Card.Root>
		</div>

		<Card.Root>
			<Card.Header class="">
				<Card.Title class="flex w-full items-center justify-between">
					<Heading class="border-none" depth={3}>{i18n.t('settings.look_and_feel')}</Heading>
					<Link
						href="/admin"
						class="hidden text-base text-muted-foreground no-underline lg:flex"
						showIcon>{i18n.t('common.admin')}</Link
					>
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<AppearanceSettings {form} />
			</Card.Content>
		</Card.Root>
	</div>
</div>
