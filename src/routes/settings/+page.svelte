<script lang="ts">
	import { Link } from '$lib/components/typography';
	import Heading from '$lib/components/typography/Heading.svelte';
	import * as Card from '$lib/components/ui/card';
	import SettingsForm from './SettingsForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import { RotateCcw } from 'lucide-svelte';
	import { resetDesktopFiles } from '$lib/stores/desktop';
	import { toast } from 'svelte-sonner';
	import { i18n } from '$lib/i18n/i18n.svelte';
</script>

<div class="container">
	<Card.Root class="mb-40 max-w-screen-sm">
		<Card.Header>
			<Card.Title class="flex w-full items-center justify-between">
				<Heading class="mb-0">{i18n.t('settings.title')}</Heading>
				<Link href="/admin" class="text-muted-foreground no-underline" showIcon>{i18n.t('common.admin')}</Link>
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<SettingsForm />
		</Card.Content>
		<Card.Footer class="flex flex-col items-start justify-end gap-4 sm:flex-row sm:items-center">
			<Heading depth={4} class="mr-auto text-muted-foreground">{i18n.t('settings.actions')}</Heading
			>
			<Button
				variant="outline"
				size="sm"
				onclick={() => {
					resetDesktopFiles();
					toast.success(i18n.t('settings.reset_success'));
				}}
			>
				<RotateCcw class="mr-2 h-4 w-4" />
				{i18n.t('settings.reset_desktop')}
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
