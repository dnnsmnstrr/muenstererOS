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
		onSuccess?: () => void;
	}

	let {
		topic,
		placeholder = i18n.t('ping.placeholder'),
		submitLabel = i18n.t('ping.send'),
		submittingLabel = i18n.t('ping.sending'),
		successMessage = i18n.t('ping.success'),
		errorMessage = i18n.t('ping.error'),
		onSuccess
	}: Props = $props();

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
				toast.success(successMessage);
				message = '';
				if (onSuccess) onSuccess();
			} else {
				throw new Error('Failed to send message');
			}
		} catch (error) {
			console.error(error);
			toast.error(errorMessage);
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
		placeholder={placeholder}
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
			{submittingLabel}
		{:else}
			<Send class="mr-2 h-4 w-4" />
			{submitLabel}
			<Kbd class="ml-2 text-[10px]">cmd + enter</Kbd>
		{/if}
	</Button>
</form>
