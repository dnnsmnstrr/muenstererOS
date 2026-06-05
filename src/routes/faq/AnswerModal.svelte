<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { GitHubGistAPI } from '$lib/utils/github-api';
	import { gists, NTFY_TOPIC_FAQ } from '$lib/config';
	import { toast } from 'svelte-sonner';
	import type { FAQItem, NtfyMessage } from '$lib/types';

	let {
		open = $bindable(false),
		question = '',
		ntfyId = '',
		onSuccess
	}: {
		open: boolean;
		question: string;
		ntfyId?: string;
		onSuccess?: () => void;
	} = $props();

	let questionEn = $state(question);
	let questionDe = $state('');
	let answerEn = $state('');
	let answerDe = $state('');
	let category = $state('');
	let tags = $state('');
	let isSaving = $state(false);

	$effect(() => {
		if (open) {
			questionEn = question;
		}
	});

	async function handleSave() {
		const token = localStorage.getItem('github_admin_token');
		if (!token) {
			toast.error('No admin token found');
			return;
		}

		isSaving = true;
		try {
			const api = new GitHubGistAPI(token);
			const gistId = gists.faq.id;
			const filename = gists.faq.filename;

			// Fetch current FAQ data
			const gist = await api.fetchGist(gistId);
			const currentContent = gist.files[filename].content;
			const faqData: FAQItem[] = JSON.parse(currentContent);

			// Add new item
			const newItem: FAQItem = {
				question: questionEn,
				answer: answerEn
			};

			if (questionDe) newItem.question_de = questionDe;
			if (answerDe) newItem.answer_de = answerDe;
			if (category) newItem.category = category;
			if (tags) newItem.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);

			faqData.push(newItem);

			// Update gist
			await api.updateGist(gistId, {
				files: {
					[filename]: {
						content: JSON.stringify(faqData, null, 2)
					}
				}
			});

			// Refresh cache
			await fetch(`/api/gists/faq?refresh=true`, {
				headers: {
					Authorization: `token ${token}`
				}
			});

			// Delete ntfy message if we have an ID and admin token
			if (ntfyId) {
				const ntfyToken = localStorage.getItem('ntfy_admin_token');
				const headers: Record<string, string> = {};
				if (ntfyToken) {
					headers['Authorization'] = `Bearer ${ntfyToken}`;
				}
				await fetch(`https://ntfy.sh/${NTFY_TOPIC_FAQ}/${ntfyId}`, {
					method: 'DELETE',
					headers
				}).catch((err) => console.error('Failed to delete ntfy message:', err));
			}

			toast.success(i18n.t('faq.success'));
			open = false;
			if (onSuccess) onSuccess();

			// Reset form
			questionDe = '';
			answerEn = '';
			answerDe = '';
			category = '';
			tags = '';
		} catch (error) {
			console.error('Failed to save FAQ:', error);
			toast.error(i18n.t('faq.error'));
		} finally {
			isSaving = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[525px]">
		<Dialog.Header>
			<Dialog.Title>{i18n.t('faq.answer_question')}</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="question-en">{i18n.t('faq.question_en')}</Label>
				<Input id="question-en" bind:value={questionEn} />
			</div>
			<div class="grid gap-2">
				<Label for="question-de">{i18n.t('faq.question_de')}</Label>
				<Input id="question-de" bind:value={questionDe} />
			</div>
			<div class="grid gap-2">
				<Label for="answer-en">{i18n.t('faq.answer_en')}</Label>
				<Textarea id="answer-en" bind:value={answerEn} />
			</div>
			<div class="grid gap-2">
				<Label for="answer-de">{i18n.t('faq.answer_de')}</Label>
				<Textarea id="answer-de" bind:value={answerDe} />
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="category">{i18n.t('faq.category')}</Label>
					<Input id="category" bind:value={category} />
				</div>
				<div class="grid gap-2">
					<Label for="tags">{i18n.t('uses.table.tags')}</Label>
					<Input id="tags" placeholder={i18n.t('faq.tags_placeholder')} bind:value={tags} />
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="submit" onclick={handleSave} disabled={isSaving || !questionEn || !answerEn}>
				{isSaving ? i18n.t('admin.editor.saving') : i18n.t('faq.save_faq')}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
