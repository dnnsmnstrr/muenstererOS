<script lang="ts">
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { Heading } from '$lib/components/typography';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils/utils';

	let password = $state('');
	let isUnlocked = $state(false);

	const availableStickers = [
		'sticker_pizza.png',
		'sticker_svelte.png',
		'sticker_github.png',
		'sticker_vercel.png',
		'sticker_archive.png',
		'sticker_css.png',
		'sticker_mastodon.png',
		'sticker_zen.png'
	];

	let selectedSticker = $state(availableStickers[0]);

	interface PlacedSticker {
		id: string;
		src: string;
		x: number;
		y: number;
		rotation: number;
		isPeeling: boolean;
	}

	let stickers = $state<PlacedSticker[]>([]);

	function peelSticker(id: string) {
		const index = stickers.findIndex((s) => s.id === id);
		if (index !== -1) {
			stickers[index].isPeeling = true;
			setTimeout(() => {
				stickers = stickers.filter((s) => s.id !== id);
			}, 500);
		}
	}

	function handleUnlock() {
		if (password.toLowerCase() === 'paula') {
			isUnlocked = true;
			toast.success('Access granted');
		} else {
			toast.error(i18n.t('pap.invalid_password'));
			password = '';
		}
	}
</script>

<svelte:head>
	<title>{i18n.t('pap.title')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<div class="container mx-auto flex h-full flex-col items-center justify-center space-y-8 p-4">
	{#if !isUnlocked}
		<div class="flex w-full max-w-md flex-col space-y-4 rounded-lg border bg-card p-8 shadow-lg">
			<Heading depth={2} class="text-center">{i18n.t('pap.title')}</Heading>
			<p class="text-center text-muted-foreground">{i18n.t('pap.password_prompt')}</p>
			<div class="flex flex-col space-y-2">
				<Input
					type="password"
					placeholder={i18n.t('pap.password_placeholder')}
					bind:value={password}
					onkeydown={(e) => e.key === 'Enter' && handleUnlock()}
				/>
				<Button onclick={handleUnlock}>{i18n.t('pap.unlock')}</Button>
			</div>
		</div>
	{:else}
		<div class="flex h-full w-full flex-col space-y-6">
			<div class="flex items-center justify-between">
				<Heading class="mb-0">{i18n.t('pap.title')}</Heading>
				<p class="hidden text-sm text-muted-foreground sm:block">{i18n.t('pap.peel_hint')}</p>
				<Button variant="outline" onclick={() => (isUnlocked = false)} size="sm">
					{i18n.t('common.quit')}
				</Button>
			</div>

			<div class="sticky top-0 z-10 flex w-full justify-center">
				<div
					class="flex items-center space-x-2 rounded-full border bg-background/80 p-2 shadow-sm backdrop-blur-sm"
				>
					<span class="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						{i18n.t('pap.stickers_label')}
					</span>
					{#each availableStickers as sticker}
						<button
							class={cn(
								'h-10 w-16 overflow-hidden rounded border-2 p-1 transition-all hover:scale-110 active:scale-95',
								selectedSticker === sticker ? 'border-primary bg-accent' : 'border-transparent'
							)}
							onclick={() => (selectedSticker = sticker)}
						>
							<img src="/images/{sticker}" alt="Sticker" class="h-full w-full object-contain" />
						</button>
					{/each}
					<div class="mx-2 h-6 w-px bg-border"></div>
					<Button
						variant="ghost"
						size="sm"
						onclick={() => (stickers = [])}
						class="text-xs"
						disabled={stickers.length === 0}
					>
						{i18n.t('pap.clear_canvas')}
					</Button>
				</div>
			</div>

			<!-- Workspace -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="relative flex-grow cursor-crosshair overflow-hidden rounded-xl border bg-card/50 shadow-inner"
				onclick={(e) => {
					if (e.target === e.currentTarget) {
						const rect = e.currentTarget.getBoundingClientRect();
						const x = e.clientX - rect.left;
						const y = e.clientY - rect.top;

						stickers.push({
							id: crypto.randomUUID(),
							src: `/images/${selectedSticker}`,
							x,
							y,
							rotation: Math.random() * 40 - 20,
							isPeeling: false
						});
					}
				}}
			>
				{#each stickers as sticker (sticker.id)}
					<button
						class={cn(
							'sticker absolute h-16 w-24 -translate-x-1/2 -translate-y-1/2 cursor-pointer outline-none transition-all duration-500',
							sticker.isPeeling ? 'peeling opacity-0 scale-150' : 'hover:scale-110 active:scale-95'
						)}
						style="left: {sticker.x}px; top: {sticker.y}px; transform: translate(-50%, -50%) rotate({sticker.rotation}deg);"
						onclick={() => peelSticker(sticker.id)}
					>
						<img
							src={sticker.src}
							alt="Sticker"
							class="h-full w-full object-contain drop-shadow-[2px_4px_6px_rgba(0,0,0,0.3)]"
						/>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.sticker {
		filter: drop-shadow(2px 2px 0px rgba(255, 255, 255, 0.5));
	}

	.sticker:hover {
		filter: drop-shadow(4px 8px 12px rgba(0, 0, 0, 0.4));
	}

	.peeling {
		pointer-events: none;
		transform: translate(-50%, -100%) rotate(45deg) skew(20deg) !important;
	}
</style>
