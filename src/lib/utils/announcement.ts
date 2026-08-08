import type { AnnouncementCampaign } from '$lib/config';

type AnnouncementStorage = Pick<Storage, 'getItem' | 'setItem'>;

const DISMISSED_VALUE = 'dismissed';

export function getAnnouncementStorageKey(campaignId: string): string {
	return `announcement-campaign-${campaignId}`;
}

export function isAnnouncementCampaignDismissed(
	campaignId: string,
	storage: AnnouncementStorage
): boolean {
	return storage.getItem(getAnnouncementStorageKey(campaignId)) === DISMISSED_VALUE;
}

export function shouldShowAnnouncementCampaign(
	campaign: Pick<AnnouncementCampaign, 'campaignId'> | null,
	storage: AnnouncementStorage
): boolean {
	return campaign !== null && !isAnnouncementCampaignDismissed(campaign.campaignId, storage);
}

export function dismissAnnouncementCampaign(
	campaignId: string,
	storage: AnnouncementStorage
): void {
	storage.setItem(getAnnouncementStorageKey(campaignId), DISMISSED_VALUE);
}
