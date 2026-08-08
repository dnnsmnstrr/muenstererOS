import { describe, expect, it } from 'vitest';
import {
	dismissAnnouncementCampaign,
	getAnnouncementStorageKey,
	isAnnouncementCampaignDismissed,
	shouldShowAnnouncementCampaign
} from './announcement';

function createStorage(initialEntries: Record<string, string> = {}) {
	const values = new Map(Object.entries(initialEntries));

	return {
		getItem(key: string) {
			return values.get(key) ?? null;
		},
		setItem(key: string, value: string) {
			values.set(key, value);
		}
	};
}

describe('announcement campaign logic', () => {
	const campaign = {
		campaignId: 'project-launch-1',
		translationKey: 'announcement.project.launch',
		iconSrc: '/images/project.svg',
		href: 'https://example.com/project'
	};

	it('uses a campaign-specific storage key', () => {
		expect(getAnnouncementStorageKey('project-launch-2')).toBe(
			'announcement-campaign-project-launch-2'
		);
	});

	it('does not show when there is no active campaign', () => {
		const storage = createStorage();

		expect(shouldShowAnnouncementCampaign(null, storage)).toBe(false);
	});

	it('shows an active campaign that has not been dismissed', () => {
		const storage = createStorage();

		expect(shouldShowAnnouncementCampaign(campaign, storage)).toBe(true);
	});

	it('persists a dismissal and hides that campaign', () => {
		const storage = createStorage();
		dismissAnnouncementCampaign(campaign.campaignId, storage);

		expect(isAnnouncementCampaignDismissed(campaign.campaignId, storage)).toBe(true);
		expect(shouldShowAnnouncementCampaign(campaign, storage)).toBe(false);
	});

	it('does not carry a dismissal over to a different campaign', () => {
		const storage = createStorage({
			[getAnnouncementStorageKey('project-launch-1')]: 'dismissed'
		});

		expect(
			shouldShowAnnouncementCampaign(
				{ ...campaign, campaignId: 'another-project-launch-1' },
				storage
			)
		).toBe(true);
	});

	it('ignores unrelated values stored under the campaign key', () => {
		const storage = createStorage({
			[getAnnouncementStorageKey('project-launch-1')]: 'seen'
		});

		expect(isAnnouncementCampaignDismissed('project-launch-1', storage)).toBe(false);
	});
});
