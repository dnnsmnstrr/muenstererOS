<script lang="ts">
	import Heading from '$lib/components/typography/Heading.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { achievements } from '$lib/stores/achievements';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import Award from '$lib/components/icons/award.svelte';
	import ShipWheel from '$lib/components/icons/ship-wheel.svelte';
	import ListChecks from '$lib/components/icons/list-checks.svelte';
	import { cn } from '$lib/utils/utils';
	import { formatDate } from '$lib/utils/helper';
	import { Lock, PartyPopper } from 'lucide-svelte';

	const achievementIcons = {
		explorer: ListChecks,
		konami: Award,
		'lucky-spin': ShipWheel
	};

	let achievementList = $derived(
		Object.values($achievements).map((a) => ({
			...a,
			title: i18n.t(`achievements.${a.id}.title`),
			description: i18n.t(`achievements.${a.id}.description`),
			icon: achievementIcons[a.id as keyof typeof achievementIcons] || PartyPopper
		}))
	);

	let unlockedCount = $derived(achievementList.filter((a) => a.unlocked).length);
	let totalCount = $derived(achievementList.length);
	let overallProgress = $derived((unlockedCount / totalCount) * 100);
</script>

<svelte:head>
	<title>{i18n.t('common.achievements')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<div class="container pb-8 md:p-12">
	<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<Heading>{i18n.t('common.achievements')}</Heading>
			<p class="mt-2 text-muted-foreground">
				{i18n.t('achievements.subtitle', {
					count: unlockedCount.toString(),
					total: totalCount.toString()
				})}
			</p>
		</div>
		<div class="w-full sm:w-64">
			<div class="mb-2 flex justify-between text-sm font-medium">
				<span>{i18n.t('achievements.overall_progress')}</span>
				<span>{Math.round(overallProgress)}%</span>
			</div>
			<Progress value={overallProgress} class="h-2" />
		</div>
	</div>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each achievementList as achievement}
			<Card.Root
				class={cn(
					'group relative overflow-hidden transition-all duration-300 hover:shadow-lg',
					achievement.unlocked ? 'border-primary/50 bg-primary/5' : 'opacity-80'
				)}
			>
				<div
					class="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
				></div>

				<Card.Header class="pb-2">
					<div class="flex items-start justify-between">
						<div
							class={cn(
								'rounded-lg p-2 transition-transform duration-300 group-hover:scale-110',
								achievement.unlocked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
							)}
						>
							{#if achievement.unlocked}
								<achievement.icon size={32} />
							{:else}
								<Lock size={32} />
							{/if}
						</div>
						{#if achievement.unlocked && achievement.unlockedAt}
							<span class="text-[10px] text-muted-foreground">
								{formatDate(new Date(achievement.unlockedAt).toISOString())}
							</span>
						{/if}
					</div>
					<Card.Title class="mt-4 flex items-center gap-2">
						{achievement.title}
					</Card.Title>
					<Card.Description class="min-h-10">
						{achievement.description}
					</Card.Description>
				</Card.Header>

				<Card.Content>
					{#if achievement.maxProgress && achievement.maxProgress > 1}
						<div class="space-y-2">
							<div class="flex justify-between text-xs text-muted-foreground">
								<span>{achievement.progress} / {achievement.maxProgress}</span>
								<span>{Math.round(((achievement.progress || 0) / achievement.maxProgress) * 100)}%</span>
							</div>
							<Progress
								value={((achievement.progress || 0) / achievement.maxProgress) * 100}
								class="h-1.5"
							/>
						</div>
					{/if}
				</Card.Content>

				{#if !achievement.unlocked}
					<div
						class="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover:opacity-100"
					>
						<span class="rounded-full bg-background/80 px-3 py-1 text-xs font-bold shadow-sm">
							{i18n.t('achievements.locked')}
						</span>
					</div>
				{/if}
			</Card.Root>
		{/each}
	</div>
</div>

<style>
	:global(.group:hover) {
		border-color: hsl(var(--primary) / 0.5);
	}
</style>
