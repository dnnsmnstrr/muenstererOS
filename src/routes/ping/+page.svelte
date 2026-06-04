<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX, NTFY_URL, NTFY_TOPIC, USERNAME_SHORT } from '$lib/config';
	import Heading from '$lib/components/typography/Heading.svelte';
	import { Button } from '$lib/components/ui/button';
	import MessageInput from '$lib/components/MessageInput.svelte';
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
	import { Send, InfoIcon, Trash2 } from 'lucide-svelte';
	import { Kbd } from '$lib/components/typography';
	import { ConfirmDeleteDialog, confirmDelete } from '$lib/components/ui/confirm-delete-dialog';

	let clearing = $state(false);
	let isAdmin = $state(false);

	let recentMessages = $state<NtfyMessage[]>([]);
	let loadingLatest = $state(true);
	let fetchError = $state(false);

	const ntfyEmail = `ntfy-${NTFY_TOPIC}@ntfy.sh`;

	async function checkAdminStatus() {
		if (!browser) return;
		const token = localStorage.getItem('github_admin_token');
		if (!token) return;

		try {
			const response = await fetch('https://api.github.com/user', {
				headers: {
					Authorization: `token ${token}`,
					Accept: 'application/vnd.github.v3+json'
				}
			});
			if (response.ok) {
				const userData = await response.json();
				isAdmin = userData.login === USERNAME_SHORT;
			}
		} catch (error) {
			console.error('Failed to verify admin status:', error);
		}
	}

	async function fetchRecentMessages() {
		loadingLatest = true;
		fetchError = false;
		try {
			const response = await fetch(`${NTFY_URL}/json?poll=1&since=all`);
			if (!response.ok) throw new Error('Failed to fetch');

			const text = await response.text();
			const lines = text.trim().split('\n');
			const messages: NtfyMessage[] = [];
			const deletedIds = new Set<string>();

			for (const line of lines) {
				try {
					if (!line.trim()) continue;
					const msg = JSON.parse(line) as NtfyMessage;
					if (msg.event === 'message') {
						messages.push(msg);
					} else if (
						(msg.event === 'message_delete' || msg.event === 'message_clear') &&
						msg.sequence_id
					) {
						deletedIds.add(msg.sequence_id);
					}
				} catch (e) {
					console.error('Error parsing NDJSON line:', e);
				}
			}
			recentMessages = messages
				.filter((m) => !deletedIds.has(m.id) && (!m.sequence_id || !deletedIds.has(m.sequence_id)))
				.reverse();
		} catch (error) {
			console.error('Error fetching recent messages:', error);
			fetchError = true;
		} finally {
			loadingLatest = false;
		}
	}

	onMount(() => {
		fetchRecentMessages();
		checkAdminStatus();
	});

	async function clearAllMessages() {
		if (recentMessages.length === 0) return;

		confirmDelete({
			title: i18n.t('ping.clear_all'),
			description: i18n.t('ping.clear_confirm'),
			confirm: { text: i18n.t('common.yes') },
			cancel: { text: i18n.t('common.no') },
			onConfirm: async () => {
				clearing = true;
				let successCount = 0;
				let failCount = 0;

				try {
					const ntfyToken = localStorage.getItem('ntfy_admin_token');
					let needsToken = false;
					for (const msg of recentMessages) {
						try {
							const idToDelete = msg.id;
							const response = await fetch(`${NTFY_URL}/${idToDelete}`, {
								method: 'DELETE',
								headers: ntfyToken
									? {
											Authorization: `Bearer ${ntfyToken}`
										}
									: {}
							});
							if (response.ok) {
								successCount++;
							} else {
								if (response.status === 401 || response.status === 403) {
									needsToken = true;
								}
								failCount++;
							}
						} catch (e) {
							console.error(`Failed to delete message ${msg.id}:`, e);
							failCount++;
						}
					}

					if (failCount === 0) {
						toast.success(i18n.t('ping.clear_success'));
						recentMessages = [];
					} else {
						const errorMessage = needsToken
							? `${i18n.t('ping.clear_error')} (Admin token required)`
							: i18n.t('ping.clear_error');
						if (successCount > 0) {
							toast.warning(errorMessage);
						} else {
							toast.error(errorMessage);
						}
					}
				} finally {
					clearing = false;
					// Wait a bit for the ntfy server to reflect changes
					setTimeout(() => {
						fetchRecentMessages();
					}, 500);
				}
			}
		});
	}

</script>

<svelte:head>
	<title>{i18n.t('ping.title')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<div class="container max-w-2xl py-8">
	<Heading>{i18n.t('ping.title')}</Heading>

	<Card class="mt-8">
		<CardHeader>
			<CardDescription>
				{i18n.t('ping.description')}
				<br />
				{i18n.t('ping.email_prefix')}
				<a href="mailto:{ntfyEmail}" class="text-primary hover:underline">{ntfyEmail}</a>
				{i18n.t('ping.email_suffix')}
			</CardDescription>
		</CardHeader>
		<CardContent>
			<MessageInput topic={NTFY_TOPIC} onSuccess={fetchRecentMessages} />
		</CardContent>
	</Card>

	<ConfirmDeleteDialog />

	<Accordion.Root type="single" class="mt-4">
		<Accordion.Item value="latest">
			<Accordion.Trigger class="text-sm">
				<div class="flex items-center gap-2 overflow-hidden pr-4">
					<InfoIcon class="h-4 w-4 shrink-0" />
					<span class="shrink-0">{i18n.t('ping.latest_message')}</span>
					{#if recentMessages.length > 0}
						<span class="text-muted-foreground truncate text-xs font-normal">
							— {recentMessages[0].message}
						</span>
					{/if}
				</div>
			</Accordion.Trigger>
			<Accordion.Content>
				{#if loadingLatest}
					<p class="text-muted-foreground text-sm">{i18n.t('api.loading')}</p>
				{:else if fetchError}
					<p class="text-destructive text-sm">{i18n.t('ping.fetch_error')}</p>
				{:else if recentMessages.length > 0}
					<div class="divide-y divide-border">
						{#each recentMessages as msg}
							<div class="py-3 first:pt-0 last:pb-0">
								{#if msg.title}
									<p class="text-sm font-semibold">{msg.title}</p>
								{/if}
								<p class="text-sm">{msg.message}</p>
								<p class="text-muted-foreground text-xs">
									{getFriendlyTime(new Date(msg.time * 1000))}
								</p>
							</div>
						{/each}
					</div>

					{#if isAdmin}
						<div class="mt-4 flex justify-end">
							<Button
								variant="destructive"
								size="sm"
								disabled={clearing}
								onclick={() => clearAllMessages()}
							>
								{#if clearing}
									{i18n.t('ping.clearing')}
								{:else}
									<Trash2 class="mr-2 h-4 w-4" />
									{i18n.t('ping.clear_all')}
								{/if}
							</Button>
						</div>
					{/if}
				{:else}
					<p class="text-muted-foreground text-sm">{i18n.t('ping.no_messages')}</p>
				{/if}
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>
