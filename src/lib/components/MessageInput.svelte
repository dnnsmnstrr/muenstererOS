<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Kbd } from '$lib/components/typography';
	import { Send } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { NTFY_URL } from '$lib/config';

	interface Props {
		topic: string;
		placeholder?: string;
		submitLabel?: string;
		submittingLabel?: string;
		successMessage?: string;
		errorMessage?: string;
		onSuccess?: (data?: any) => void;
	}

	let {
		topic,
		placeholder,
		submitLabel,
		submittingLabel,
		successMessage,
		errorMessage,
		onSuccess
	}: Props = $props();

	let actualPlaceholder = $derived(placeholder ?? i18n.t('ping.placeholder'));
	let actualSubmitLabel = $derived(submitLabel ?? i18n.t('ping.send'));
	let actualSubmittingLabel = $derived(submittingLabel ?? i18n.t('ping.sending'));
	let actualSuccessMessage = $derived(successMessage ?? i18n.t('ping.success'));
	let actualErrorMessage = $derived(errorMessage ?? i18n.t('ping.error'));

	let message = $state('');
	let loading = $state(false);

	async function sendMessage() {
		if (!message.trim()) return;

		loading = true;
		try {
			const url = topic.startsWith('http') ? topic : `https://ntfy.sh/${topic}`;
			const response = await fetch(url, {
				method: 'POST',
				body: message
			});

			if (response.ok) {
				let resData: any = null;
				try {
					resData = await response.json();
				} catch {
					// Ignored if non-JSON response
				}
				toast.success(actualSuccessMessage);
				message = '';
				if (onSuccess) onSuccess(resData);
			} else {
				throw new Error('Failed to send message');
			}
		} catch (error) {
			console.error(error);
			toast.error(actualErrorMessage);
		} finally {
			loading = false;
		}
	}
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		sendMessage();
	}}
	class="space-y-4"
>
	<Textarea
		bind:value={message}
		placeholder={actualPlaceholder}
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
			{actualSubmittingLabel}
		{:else}
			<Send class="mr-2 h-4 w-4" />
			{actualSubmitLabel}
			<Kbd class="ml-2 text-[10px]">cmd + enter</Kbd>
		{/if}
	</Button>
</form>
