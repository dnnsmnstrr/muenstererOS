<script lang="ts">
	import { Link } from '$lib/components/typography';
	import Heading from '$lib/components/typography/Heading.svelte';
	import * as Card from '$lib/components/ui/card';
	import SettingsForm from './SettingsForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import { RotateCcw } from 'lucide-svelte';
	import { resetDesktopFiles } from '$lib/stores/desktop';
	import { toast } from 'svelte-sonner';
</script>

<div class="container">
	<div class="flex max-w-screen-sm items-center justify-between">
		<Heading>Settings</Heading>
		<Link href="/admin" class="text-muted-foreground no-underline" showIcon>Admin</Link>
	</div>

	<Card.Root class="mb-40 max-w-screen-sm">
		<Card.Header>
			<Card.Title>Look & Feel</Card.Title>
		</Card.Header>
		<Card.Content>
			<SettingsForm />
		</Card.Content>
		<Card.Footer class="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
			<Heading depth={4} class="mr-auto text-muted-foreground">Actions</Heading>
			<Button
				variant="outline"
				size="sm"
				onclick={() => {
					resetDesktopFiles();
					toast.success('Desktop files reset to default positions');
				}}
			>
				<RotateCcw class="mr-2 h-4 w-4" />
				Reset Desktop Files
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
