<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX, NTFY_TOPIC_FAQ, USERNAME_SHORT } from '$lib/config';
	import Heading from '$lib/components/typography/Heading.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import MessageInput from '$lib/components/MessageInput.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import type { PageProps } from './$types';
	import type { NtfyMessage, FAQItem } from '$lib/types';
	import { getFriendlyTime } from '$lib/utils/helper';
	import { MessageCircleQuestion, InfoIcon } from 'lucide-svelte';

	let { data }: PageProps = $props();

	let isAdmin = $state(false);
	let recentQuestions = $state<NtfyMessage[]>([]);
	let loadingQuestions = $state(false);

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

	async function fetchRecentQuestions() {
		if (!isAdmin) return;
		loadingQuestions = true;
		try {
			const response = await fetch(`https://ntfy.sh/${NTFY_TOPIC_FAQ}/json?poll=1&since=all`);
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
			recentQuestions = messages
				.filter((m) => !deletedIds.has(m.id) && (!m.sequence_id || !deletedIds.has(m.sequence_id)))
				.reverse();
		} catch (error) {
			console.error('Error fetching recent questions:', error);
		} finally {
			loadingQuestions = false;
		}
	}

	onMount(async () => {
		await checkAdminStatus();
		if (isAdmin) {
			fetchRecentQuestions();
		}
	});

	const getLocalized = (item: FAQItem, key: 'question' | 'answer') => {
		if (i18n.lang === 'de' && item[`${key}_de` as keyof FAQItem]) {
			return item[`${key}_de` as keyof FAQItem] as string;
		}
		return item[key];
	};
</script>

<svelte:head>
	<title>{i18n.t('faq.title')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<div class="container max-w-3xl py-8">
	<Heading>{i18n.t('faq.title')}</Heading>
	<p class="text-muted-foreground mt-2">{i18n.t('faq.description')}</p>

	{#if data.faqData && data.faqData.length > 0}
		<Accordion.Root type="single" collapsible class="mt-8">
			{#each data.faqData as item, i}
				<Accordion.Item value="item-{i}">
					<Accordion.Trigger class="text-left">
						{getLocalized(item, 'question')}
					</Accordion.Trigger>
					<Accordion.Content>
						<div class="prose prose-sm dark:prose-invert max-w-none">
							{getLocalized(item, 'answer')}
						</div>
						{#if item.tags && item.tags.length > 0}
							<div class="mt-4 flex flex-wrap gap-2">
								{#each item.tags as tag}
									<span
										class="bg-secondary text-secondary-foreground rounded-full px-2 py-1 text-xs"
									>
										{tag}
									</span>
								{/each}
							</div>
						{/if}
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	{:else}
		<Card class="mt-8 border-dashed">
			<CardContent class="flex flex-col items-center justify-center py-12">
				<MessageCircleQuestion class="text-muted-foreground mb-4 h-12 w-12 opacity-20" />
				<p class="text-muted-foreground">{i18n.t('faq.no_data')}</p>
			</CardContent>
		</Card>
	{/if}

	<Card class="mt-12">
		<CardHeader>
			<CardTitle>{i18n.t('faq.ask_title')}</CardTitle>
			<CardDescription>{i18n.t('faq.ask_description')}</CardDescription>
		</CardHeader>
		<CardContent>
			<MessageInput
				topic={NTFY_TOPIC_FAQ}
				placeholder={i18n.t('faq.placeholder')}
				submitLabel={i18n.t('faq.submit')}
				submittingLabel={i18n.t('faq.submitting')}
				successMessage={i18n.t('faq.success')}
				errorMessage={i18n.t('faq.error')}
				onSuccess={fetchRecentQuestions}
			/>
		</CardContent>
	</Card>

	{#if isAdmin}
		<div class="mt-8">
			<Accordion.Root type="single" class="mt-4">
				<Accordion.Item value="pending">
					<Accordion.Trigger class="text-sm">
						<div class="flex items-center gap-2 overflow-hidden pr-4">
							<InfoIcon class="h-4 w-4 shrink-0" />
							<span class="shrink-0">{i18n.t('faq.pending_questions')}</span>
							{#if recentQuestions.length > 0}
								<span class="text-muted-foreground truncate text-xs font-normal">
									— {recentQuestions[0].message}
								</span>
							{/if}
						</div>
					</Accordion.Trigger>
					<Accordion.Content>
						{#if loadingQuestions}
							<p class="text-muted-foreground text-sm">{i18n.t('api.loading')}</p>
						{:else if recentQuestions.length > 0}
							<div class="divide-y divide-border">
								{#each recentQuestions as msg}
									<div class="py-3 first:pt-0 last:pb-0">
										<p class="text-sm">{msg.message}</p>
										<p class="text-muted-foreground text-xs">
											{getFriendlyTime(new Date(msg.time * 1000))}
										</p>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-muted-foreground text-sm">{i18n.t('ping.no_messages')}</p>
						{/if}
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	{/if}
</div>
