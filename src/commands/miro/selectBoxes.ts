import { MiroExtractError } from "./MiroExtractError";
import type { MiroItem, MiroRect } from "./types";

const boxTypes = new Set(["shape", "sticky_note"]);

function findAnchor(items: MiroItem[], id: string): MiroItem {
	const anchor = items.find((item) => item.id === id);
	if (!anchor)
		throw new MiroExtractError(
			`No item with id ${id} in the supplied items. Re-dump the frame so the anchor is included, then try again.`,
		);
	return anchor;
}

function isBox(item: MiroItem): boolean {
	return boxTypes.has(item.type) && item.text.length > 0;
}

function centreInside(rect: MiroRect, item: MiroItem): boolean {
	const x = (item.left + item.right) / 2;
	const y = (item.top + item.bottom) / 2;
	return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export function selectBoxes(
	items: MiroItem[],
	topLeftId: string,
	bottomRightId: string,
): MiroItem[] {
	const topLeft = findAnchor(items, topLeftId);
	const bottomRight = findAnchor(items, bottomRightId);
	const rect: MiroRect = {
		left: topLeft.left,
		top: topLeft.top,
		right: bottomRight.right,
		bottom: bottomRight.bottom,
	};
	return items
		.filter((item) => isBox(item) && centreInside(rect, item))
		.sort((a, b) => a.left - b.left || a.top - b.top);
}
