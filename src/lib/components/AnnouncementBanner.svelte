<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowUpRight, X } from 'lucide-svelte';
	import { ACTIVE_ANNOUNCEMENT_CAMPAIGN } from '$lib/config';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import {
		dismissAnnouncementCampaign,
		shouldShowAnnouncementCampaign
	} from '$lib/utils/announcement';

	const campaign = ACTIVE_ANNOUNCEMENT_CAMPAIGN;

	let isReady = $state(false);
	let shouldShow = $state(false);

	const isVisible = $derived(isReady && shouldShow);
	const copy = (key: string) => (campaign ? i18n.t(`${campaign.translationKey}.${key}`) : '');

	onMount(() => {
		shouldShow = shouldShowAnnouncementCampaign(campaign, localStorage);
		isReady = true;
	});

	function dismiss() {
		if (!campaign) return;

		shouldShow = false;
		dismissAnnouncementCampaign(campaign.campaignId, localStorage);
	}
</script>

{#if isVisible && campaign}
	<aside class="announcement-banner mx-6 mb-2 sm:mx-16" aria-label={copy('aria_label')}>
		<div class="flex min-w-0 items-center gap-3 sm:gap-4">
			<div class="campaign-icon" aria-hidden="true">
				<img src={campaign.iconSrc} alt="" />
			</div>

			<div class="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-3">
				<div class="flex items-center gap-2">
					<p class="truncate text-sm font-semibold">{copy('title')}</p>
					<span class="status-badge">
						<span class="status-dot"></span>
						{copy('status')}
					</span>
				</div>
				<p class="mt-0.5 truncate text-xs text-muted-foreground sm:mt-0 sm:text-sm">
					{copy('message')}
				</p>
			</div>
		</div>

		<div class="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
			<a class="announcement-cta" href={campaign.href} target="_blank" rel="noreferrer">
				<span class="hidden sm:inline">{copy('cta')}</span>
				<ArrowUpRight class="size-4" strokeWidth={2} />
			</a>
			<button type="button" class="dismiss-button" onclick={dismiss} aria-label={copy('dismiss')}>
				<X class="size-4" strokeWidth={1.75} />
			</button>
		</div>
	</aside>
{/if}

<style>
	.announcement-banner {
		position: relative;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		overflow: hidden;
		border: 1px solid hsl(var(--foreground) / 0.16);
		border-radius: calc(var(--radius) + 0.2rem);
		background: linear-gradient(90deg, hsl(var(--foreground) / 0.055), transparent 45%),
			hsl(var(--background) / 0.88);
		padding: 0.65rem 0.7rem;
		box-shadow:
			0 1px 0 hsl(var(--background) / 0.8) inset,
			0 10px 30px hsl(var(--foreground) / 0.06);
		backdrop-filter: blur(14px);
		animation: announcement-in 400ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.announcement-banner::before {
		position: absolute;
		inset: 0;
		background-image: repeating-linear-gradient(
			105deg,
			transparent 0,
			transparent 14px,
			hsl(var(--foreground) / 0.022) 14px,
			hsl(var(--foreground) / 0.022) 15px
		);
		content: '';
		pointer-events: none;
	}

	.announcement-banner > :global(*) {
		position: relative;
	}

	.campaign-icon {
		width: 2.25rem;
		height: 2.25rem;
		flex: none;
		overflow: hidden;
		border-radius: 0.55rem;
		background: #fff;
		box-shadow:
			0 0 0 1px hsl(var(--foreground) / 0.18),
			0 1px 2px hsl(var(--foreground) / 0.12);
	}

	.campaign-icon img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		white-space: nowrap;
		border: 1px solid hsl(var(--foreground) / 0.12);
		border-radius: 999px;
		background: hsl(var(--background) / 0.7);
		padding: 0.1rem 0.4rem;
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		line-height: 1rem;
		text-transform: uppercase;
	}

	.status-dot {
		width: 0.35rem;
		height: 0.35rem;
		border-radius: 999px;
		background: currentColor;
		box-shadow: 0 0 0 3px hsl(var(--foreground) / 0.08);
		animation: status-pulse 2.4s ease-out infinite;
	}

	.announcement-cta,
	.dismiss-button {
		display: inline-flex;
		height: 2rem;
		align-items: center;
		justify-content: center;
		border-radius: calc(var(--radius) - 0.1rem);
		transition:
			transform 150ms ease,
			background-color 150ms ease;
	}

	.announcement-cta {
		gap: 0.35rem;
		background: hsl(var(--foreground));
		color: hsl(var(--background));
		padding: 0 0.65rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.dismiss-button {
		width: 2rem;
		color: hsl(var(--muted-foreground));
	}

	.announcement-cta:hover {
		transform: translateY(-1px);
	}
	.dismiss-button:hover {
		background: hsl(var(--foreground) / 0.08);
	}
	.announcement-cta:focus-visible,
	.dismiss-button:focus-visible {
		outline: 2px solid hsl(var(--ring));
		outline-offset: 2px;
	}

	@keyframes announcement-in {
		from {
			opacity: 0;
			transform: translateY(-0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes status-pulse {
		0%,
		55%,
		100% {
			box-shadow: 0 0 0 0 hsl(var(--foreground) / 0.14);
		}
		25% {
			box-shadow: 0 0 0 4px hsl(var(--foreground) / 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.announcement-banner,
		.status-dot {
			animation: none;
		}
	}
</style>
