export const ITEM_SECTION_IDS = {
	description: "item-section-description",
	acceptanceCriteria: "item-section-acceptance-criteria",
	subtasks: "item-section-subtasks",
	plan: "item-section-plan",
	activity: "item-section-activity",
	comments: "item-section-comments",
} as const;

type ItemSectionKey = keyof typeof ITEM_SECTION_IDS;

export const STICKY_PINNED_HEADER_HEIGHT = 140;

const scrollMarginTop = `${STICKY_PINNED_HEADER_HEIGHT}px`;

export function itemSectionAnchor(key: ItemSectionKey) {
	return {
		id: ITEM_SECTION_IDS[key],
		sx: { mb: 2, scrollMarginTop },
	};
}

export function phaseAnchor(index: number) {
	return {
		id: `item-phase-${index}`,
		sx: { scrollMarginTop },
	};
}
