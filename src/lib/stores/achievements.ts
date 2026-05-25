import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { i18n } from '$lib/i18n/i18n.svelte';
import { goto } from '$app/navigation';

export interface Achievement {
	id: string;
	unlocked: boolean;
	unlockedAt?: number;
	progress?: number;
	maxProgress?: number;
	level?: number;
	maxLevel?: number;
	milestones?: number[];
	metadata?: any;
}

const STORAGE_KEY = 'achievements';

function getInitialAchievements(): Record<string, Achievement> {
	return {
		onboarding: {
			id: 'onboarding',
			unlocked: false,
			metadata: {
				link: '/onboarding'
			}
		},
		explorer: {
			id: 'explorer',
			unlocked: false,
			progress: 0,
			maxProgress: 23, // Default based on current sitemap, will be updated dynamically
			level: 0,
			maxLevel: 3,
			milestones: [5, 15, 23],
			metadata: { visitedPages: [], link: '/sitemap' }
		},
		streak: {
			id: 'streak',
			unlocked: false,
			progress: 0,
			maxProgress: 3,
			metadata: { lastVisitDate: null, currentStreak: 0 }
		},
		cheatcode: {
			id: 'cheatcode',
			unlocked: false
		},
		'lucky-spin': {
			id: 'lucky-spin',
			unlocked: false,
			metadata: {
				link: '/slashes'
			}
		},
		haxor: {
			id: 'haxor',
			unlocked: false,
			metadata: {
				link: '/terminal'
			}
		},
		'theme-master': {
			id: 'theme-master',
			unlocked: false,
			metadata: { link: '/settings' }
		}
	};
}

function loadAchievements(): Record<string, Achievement> {
	if (!browser) return getInitialAchievements();
	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored) return getInitialAchievements();
	try {
		const parsed = JSON.parse(stored);
		const initial = getInitialAchievements();
		// Merge stored with initial to handle new achievements
		return { ...initial, ...parsed };
	} catch (e) {
		console.error('Failed to parse achievements', e);
		return getInitialAchievements();
	}
}

export const achievements = writable<Record<string, Achievement>>(loadAchievements());

if (browser) {
	achievements.subscribe((value) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
	});
}

export function unlockAchievement(id: string, level?: number) {
	achievements.update((state) => {
		const achievement = state[id];
		if (!achievement) return state;

		// If it's a level-up for an already unlocked achievement
		if (level && achievement.level !== undefined && level > (achievement.level || 0)) {
			// Check for level-specific icon
			let metadata = { ...achievement.metadata };
			const updatedAchievement = {
				...achievement,
				unlocked: true,
				unlockedAt: achievement.unlockedAt || Date.now(),
				level: level
			};

			toast.success(
				i18n.t('achievements.level_up_title', {
					title: i18n.t(`achievements.${id}.title`),
					level: level.toString()
				}),
				{
					description: i18n.t('achievements.level_up_message', { level: level.toString() }),
					action: {
						label: i18n.t('achievements.view_all'),
						onClick: () => goto('/achievements')
					}
				}
			);

			return {
				...state,
				[id]: updatedAchievement
			};
		}

		// Standard unlock
		if (!achievement.unlocked) {
			const unlockedAchievement = {
				...achievement,
				unlocked: true,
				unlockedAt: Date.now(),
				progress: achievement.maxProgress || 1,
				level: achievement.maxLevel ? 1 : undefined
			};

			toast.success(i18n.t(`achievements.${id}.title`), {
				description:
					i18n.t(`achievements.${id}.message`) !== `achievements.${id}.message`
						? i18n.t(`achievements.${id}.message`)
						: i18n.t(`achievements.${id}.description`),
				action: {
					label: i18n.t('achievements.view_all'),
					onClick: () => goto('/achievements')
				}
			});

			return {
				...state,
				[id]: unlockedAchievement
			};
		}
		return state;
	});
}

export function resetAchievements() {
	if (!browser) return;

	if (!confirm(i18n.t('achievements.reset_confirm'))) return;

	const initial = getInitialAchievements();
	achievements.set(initial);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
	toast.success(i18n.t('achievements.reset_success'));
}

export function trackDailyVisit() {
	achievements.update((state) => {
		const streak = state['streak'];
		if (!streak || streak.unlocked) return state;

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
		const lastVisitDate = streak.metadata?.lastVisitDate;
		const currentStreak = streak.metadata?.currentStreak || 0;

		if (!lastVisitDate) {
			// First visit
			return {
				...state,
				streak: {
					...streak,
					progress: 1,
					metadata: { lastVisitDate: today, currentStreak: 1 }
				}
			};
		}

		if (lastVisitDate === today) {
			// Already visited today
			return state;
		}

		const yesterday = today - 86400000;
		if (lastVisitDate === yesterday) {
			// Continued streak
			const newStreak = currentStreak + 1;
			if (newStreak >= 3) {
				setTimeout(() => unlockAchievement('streak'), 0);
			}
			return {
				...state,
				streak: {
					...streak,
					progress: newStreak,
					metadata: { lastVisitDate: today, currentStreak: newStreak }
				}
			};
		} else {
			// Streak broken
			return {
				...state,
				streak: {
					...streak,
					progress: 1,
					metadata: { lastVisitDate: today, currentStreak: 1 }
				}
			};
		}
	});
}

export function updateAchievementProgress(id: string, progress: number, maxProgress?: number) {
	achievements.update((state) => {
		const achievement = state[id];
		if (!achievement || achievement.unlocked) return state;

		const newProgress = Math.min(progress, maxProgress || achievement.maxProgress || progress);
		const newMaxProgress = maxProgress || achievement.maxProgress || progress;

		if (newProgress >= newMaxProgress) {
			// Trigger unlock through the update to ensure state is consistent
			setTimeout(() => unlockAchievement(id), 0);
			return state;
		}

		return {
			...state,
			[id]: {
				...achievement,
				progress: newProgress,
				maxProgress: newMaxProgress
			}
		};
	});
}


export function trackCustomization() {
	unlockAchievement('theme-master');
}

export function trackPageVisit(path: string, allPages: string[]) {
	achievements.update((state) => {
		const explorer = state['explorer'];
		if (!explorer) return state;

		const visitedPages = explorer.metadata?.visitedPages || [];
		// console.log('Tracking visit to:', path, 'In allPages:', allPages.includes(path));
		if (!visitedPages.includes(path) && allPages.includes(path)) {
			const newVisitedPages = [...visitedPages, path];
			const progress = newVisitedPages.length;
			const maxProgress = allPages.length;

			// Update milestones to ensure the last one is always maxProgress
			const milestones = explorer.milestones ? [...explorer.milestones] : undefined;
			if (milestones && milestones.length > 0) {
				milestones[milestones.length - 1] = maxProgress;
			}

			// Handle multi-level progression
			if (milestones) {
				const currentLevel = explorer.level || 0;
				const nextMilestoneIndex = currentLevel; // if level 0, next is index 0 (5), if level 1, next is index 1 (10)
				const nextMilestone = milestones[nextMilestoneIndex];

				if (nextMilestone && progress >= nextMilestone) {
					setTimeout(() => unlockAchievement('explorer', currentLevel + 1), 0);
				}
			} else if (progress >= maxProgress && !explorer.unlocked) {
				setTimeout(() => unlockAchievement('explorer'), 0);
			}

			return {
				...state,
				explorer: {
					...explorer,
					progress,
					maxProgress,
					milestones,
					metadata: { ...explorer.metadata, visitedPages: newVisitedPages }
				}
			};
		}
		return state;
	});
}

export function unlockAllAchievements() {
	if (!browser) return;

	achievements.update((state) => {
		const updated = { ...state };

		Object.keys(updated).forEach((id) => {
			if (!updated[id].unlocked || (updated[id].maxLevel && updated[id].level !== updated[id].maxLevel)) {
				updated[id] = {
					...updated[id],
					unlocked: true,
					unlockedAt: updated[id].unlockedAt || Date.now(),
					progress: updated[id].maxProgress || 1,
					level: updated[id].maxLevel || undefined
				};
			}
		});

		return updated;
	});

	toast.success('All achievements unlocked!', {
		description: 'Testing mode activated'
	});
}
