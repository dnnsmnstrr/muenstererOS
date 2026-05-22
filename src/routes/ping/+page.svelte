<script lang="ts">
	import { onMount } from 'svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX, NTFY_URL } from '$lib/config';
	import Heading from '$lib/components/typography/Heading.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Accordion from '$lib/components/ui/accordion';
	import { getFriendlyTime } from '$lib/utils/helper';
	import type { NtfyMessage } from '$lib/types';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { Send, InfoIcon } from 'lucide-svelte';

	let message = $state('');
	let loading = $state(false);

	let latestMessage = $state<NtfyMessage | null>(null);
	let loadingLatest = $state(true);
	let fetchError = $state(false);

	async function fetchLatestMessage() {
		loadingLatest = true;
		fetchError = false;
		try {
			const response = await fetch(`${NTFY_URL}/json?poll=1&since=latest`);
			if (!response.ok) throw new Error('Failed to fetch');

			const text = await response.text();
			const lines = text.trim().split('\n');

			for (let i = lines.length - 1; i >= 0; i--) {
				try {
					const msg = JSON.parse(lines[i]) as NtfyMessage;
					if (msg.event === 'message') {
						latestMessage = msg;
						break;
					}
				} catch (e) {
					console.error('Error parsing NDJSON line:', e);
				}
			}
		} catch (error) {
			console.error('Error fetching latest message:', error);
			fetchError = true;
		} finally {
			loadingLatest = false;
		}
	}

	onMount(() => {
		fetchLatestMessage();
	});

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
						if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
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

	<Accordion.Root type="single" class="mt-4">
		<Accordion.Item value="latest">
			<Accordion.Trigger class="text-sm">
				<div class="flex items-center gap-2">
					<InfoIcon class="h-4 w-4" />
					{i18n.t('ping.latest_message')}
				</div>
			</Accordion.Trigger>
			<Accordion.Content>
				{#if loadingLatest}
					<p class="text-muted-foreground text-sm">{i18n.t('api.loading')}</p>
				{:else if fetchError}
					<p class="text-destructive text-sm">{i18n.t('ping.fetch_error')}</p>
				{:else if latestMessage}
					<div class="space-y-1">
						{#if latestMessage.title}
							<p class="text-sm font-semibold">{latestMessage.title}</p>
						{/if}
						<p class="text-sm">{latestMessage.message}</p>
						<p class="text-muted-foreground text-xs">
							{getFriendlyTime(new Date(latestMessage.time * 1000))}
						</p>
					</div>
				{:else}
					<p class="text-muted-foreground text-sm">{i18n.t('ping.no_messages')}</p>
				{/if}
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>
