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
	<div class="flex max-w-screen-sm items-center justify-between">
		<Heading>{i18n.t('settings.title')}</Heading>
		<Link href="/admin" class="text-muted-foreground no-underline" showIcon>{i18n.t('common.admin')}</Link>
	</div>

	<Card.Root class="mb-40 max-w-screen-sm">
		<Card.Header>
			<Card.Title>{i18n.t('settings.look_and_feel')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<SettingsForm />
		</Card.Content>
		<Card.Footer class="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
			<Heading depth={4} class="mr-auto text-muted-foreground">{i18n.t('settings.actions')}</Heading>
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
