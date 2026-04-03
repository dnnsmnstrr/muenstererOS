<script lang="ts">
	import { onMount } from 'svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX, NTFY_URL } from '$lib/config';
	import Heading from '$lib/components/typography/Heading.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { Send } from 'lucide-svelte';

	let message = $state('');
	let loading = $state(false);

	async function sendMessage() {
		if (!message.trim()) return;

		loading = true;
		try {
			const response = await fetch(NTFY_URL, {
				method: 'POST',
				body: message
			});

			if (response.ok) {
				toast.success(i18n.t('ping.success'));
				message = '';
			} else {
				throw new Error('Failed to send message');
			}
		} catch (error) {
			console.error(error);
			toast.error(i18n.t('ping.error'));
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{i18n.t('ping.title')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<div class="container max-w-2xl py-8">
	<Heading>{i18n.t('ping.title')}</Heading>

	<Card class="mt-8">
		<CardHeader>
			<CardDescription>{i18n.t('ping.description')}</CardDescription>
		</CardHeader>
		<CardContent>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					sendMessage();
				}}
				class="space-y-4"
			>
				<Textarea
					bind:value={message}
					autofocus
					placeholder={i18n.t('ping.placeholder')}
					rows={5}
					required
					disabled={loading}
					onkeydown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							sendMessage();
						}
					}}
				/>
				<Button type="submit" disabled={loading || !message.trim()} class="w-full">
					{#if loading}
						{i18n.t('ping.sending')}
					{:else}
						<Send class="mr-2 h-4 w-4" />
						{i18n.t('ping.send')}
					{/if}
				</Button>
			</form>
		</CardContent>
	</Card>
</div>
