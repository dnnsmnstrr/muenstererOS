<script lang="ts">
	import Heading from '$lib/components/typography/Heading.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { achievements, resetAchievements, unlockAllAchievements } from '$lib/stores/achievements';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import Gamepad from '$lib/components/icons/gamepad.svelte';
	import ShipWheel from '$lib/components/icons/ship-wheel.svelte';
	import ListChecks from '$lib/components/icons/list-checks.svelte';
	import CalendarDays from '$lib/components/icons/calendar-days.svelte';
	import Terminal from '$lib/components/icons/terminal.svelte';
	import PartyPopper from '$lib/components/icons/party-popper.svelte';
	import { cn } from '$lib/utils/utils';
	import { formatDate } from '$lib/utils/helper';
	import { Check, CircleHelp, Lock, RotateCcw, Zap } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import pages from '../../data/pages.json';
	import { goto } from '$app/navigation';

	const achievementIcons = {
		explorer: ListChecks,
		cheatcode: Gamepad,
		'lucky-spin': ShipWheel,
		streak: CalendarDays,
		onboarding: PartyPopper,
		haxor: Terminal
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

	let hoveredId = $state<string | null>(null);

	let missingPages = $derived.by(() => {
		const explorer = $achievements.explorer;
		if (!explorer || explorer.unlocked) return [];
		const visitedPages = explorer.metadata?.visitedPages || [];
		return pages
			.filter((p) => p.path !== '/admin')
			.filter((p) => !visitedPages.includes(p.path))
			.map((p) => {
				const slug = p.path === '/' ? 'home' : p.path.split('/').pop() || 'home';
				const translated = i18n.t(`common.${slug}`);
				return translated !== `common.${slug}` ? translated : p.title;
			});
	});
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
		<div class="flex w-full flex-col gap-4 sm:w-64">
			<div>
				<div class="mb-2 flex justify-between text-sm font-medium">
					<span>{i18n.t('achievements.overall_progress')}</span>
					<span>{Math.round(overallProgress)}%</span>
				</div>
				<Progress value={overallProgress} class="h-2" />
			</div>
		</div>
	</div>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each achievementList as achievement}
			<Card.Root
				onmouseenter={() => (hoveredId = achievement.id)}
				onmouseleave={() => (hoveredId = null)}
				class={cn(
					'group relative overflow-hidden transition-all duration-300 hover:shadow-lg',
					achievement.unlocked ? 'border-primary/50' : 'opacity-80'
				)}
			>
				<div
					class="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
				></div>

				<Card.Header class="space-y-4 pb-2">
					<div class="flex items-start justify-between">
						<div
							class={cn(
								'h-12 rounded-lg bg-muted p-2 transition-transform duration-300 group-hover:scale-110',
								achievement.unlocked
									? 'bg-primary/20 text-foreground'
									: 'bg-muted text-muted-foreground'
							)}
						>
							{#if achievement.unlocked && achievement.metadata?.link}
								<a href={achievement.metadata?.link}>
									<achievement.icon size={32} animate={hoveredId === achievement.id} />
								</a>
							{:else if achievement.unlocked}
								<achievement.icon size={32} animate={hoveredId === achievement.id} />
							{:else}
								<Lock size={32} />
							{/if}
						</div>
						{#if achievement.unlocked && achievement.unlockedAt}
							<span class="mt-3 text-sm text-muted-foreground">
								<Check size={12} class="mr-1 inline-block" />
								{formatDate(new Date(achievement.unlockedAt).toISOString())}
							</span>
						{/if}
					</div>
					<Card.Title class="flex items-center justify-between gap-2">
						<div class="flex items-center gap-2">
							{achievement.title}
						</div>
						{#if achievement.id === 'explorer' && !achievement.unlocked && missingPages.length > 0 && missingPages.length <= 5}
							<Tooltip.Root delayDuration={0}>
								<Tooltip.Trigger>
									<CircleHelp size={18} class="text-muted-foreground hover:text-foreground" />
								</Tooltip.Trigger>
								<Tooltip.Content>
									<p class="mb-1 font-bold">{i18n.t('achievements.explorer.missing_hint')}</p>
									<ul class="list-inside list-disc">
										{#each missingPages as page}
											<li>{page}</li>
										{/each}
									</ul>
								</Tooltip.Content>
							</Tooltip.Root>
						{/if}
					</Card.Title>
					<Card.Description class="min-h-10">
						{achievement.description}
					</Card.Description>
				</Card.Header>

				<Card.Content class="pt-0">
					{#if achievement.maxProgress && achievement.maxProgress > 1}
						<div class="space-y-2">
							<div class="flex justify-between text-xs text-muted-foreground">
								<span>{achievement.progress} / {achievement.maxProgress}</span>
								<span
									>{Math.round(
										((achievement.progress || 0) / achievement.maxProgress) * 100
									)}%</span
								>
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
						class="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 backdrop-blur-[3px] transition-opacity duration-300 group-hover:opacity-100"
					>
						{#if achievement.metadata?.link}
							<Button
								variant="outline"
								class="pointer-events-auto ml-4"
								onclick={() => goto(achievement.metadata.link)}
							>
								{i18n.t('achievements.locked')}
							</Button>
						{:else}
							<span
								class="pointer-events-auto rounded-full bg-background/80 px-3 py-1 text-xs font-bold shadow-sm"
							>
								{i18n.t('achievements.locked')}
							</span>
						{/if}
					</div>
				{/if}
			</Card.Root>
		{/each}
	</div>

	<div class="mt-16 flex flex-col items-center gap-4">
		<Button variant="outline" size="sm" onclick={resetAchievements}>
			<RotateCcw class="mr-2 h-4 w-4" />
			{i18n.t('achievements.reset')}
		</Button>

		{#if import.meta.env.DEV}
			<Button
				variant="outline"
				size="sm"
				class="text-amber-600 dark:text-amber-500"
				onclick={unlockAllAchievements}
			>
				<Zap class="mr-2 h-4 w-4" />
				Unlock All (Dev)
			</Button>
		{/if}
	</div>
</div>

<style>
	:global(.group:hover) {
		border-color: hsl(var(--primary) / 0.5);
	}
</style>
