export const ITEM_SECTION_IDS = {
	description: "item-section-description",
	acceptanceCriteria: "item-section-acceptance-criteria",
	subtasks: "item-section-subtasks",
	plan: "item-section-plan",
	activity: "item-section-activity",
	comments: "item-section-comments",
} as const;

type ItemSectionKey = keyof typeof ITEM_SECTION_IDS;

const STICKY_PINNED_HEADER_HEIGHT = "140px";

export function itemSectionAnchor(key: ItemSectionKey) {
	return {
		id: ITEM_SECTION_IDS[key],
		sx: { mb: 2, scrollMarginTop: STICKY_PINNED_HEADER_HEIGHT },
	};
}

export function phaseAnchor(index: number) {
	return {
		id: `item-phase-${index}`,
		sx: { scrollMarginTop: STICKY_PINNED_HEADER_HEIGHT },
	};
}
