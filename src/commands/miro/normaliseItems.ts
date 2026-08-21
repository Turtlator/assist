import { MiroExtractError } from "./MiroExtractError";
import { stripHtml } from "./stripHtml";
import type { MiroItem, MiroRawItem } from "./types";

const frameCoordinates = "parent_top_left";

function describe(item: MiroRawItem): string {
	return `  ${item.id ?? "(no id)"} (${item.type ?? "unknown type"}): relativeTo=${item.position?.relativeTo ?? "missing"}`;
}

function coordinateSpaceError(rejected: MiroRawItem[]): MiroExtractError {
	return new MiroExtractError(
		`${rejected.length} item(s) are not in frame coordinates (position.relativeTo must be "${frameCoordinates}"):\n${rejected
			.slice(0, 5)
			.map(describe)
			.join(
				"\n",
			)}\n\nDump the frame with board_list_items using ?moveToWidget=<frame id> so every item shares one coordinate space.`,
	);
}

function toItem(item: MiroRawItem): MiroItem {
	const halfWidth = (item.geometry?.width ?? 0) / 2;
	const halfHeight = (item.geometry?.height ?? 0) / 2;
	const x = item.position?.x ?? 0;
	const y = item.position?.y ?? 0;
	return {
		id: item.id ?? "",
		type: item.type ?? "",
		text: stripHtml(item.data?.content ?? ""),
		left: x - halfWidth,
		top: y - halfHeight,
		right: x + halfWidth,
		bottom: y + halfHeight,
	};
}

export function normaliseItems(items: MiroRawItem[]): MiroItem[] {
	const rejected = items.filter(
		(item) => item.position?.relativeTo !== frameCoordinates,
	);
	if (rejected.length > 0) throw coordinateSpaceError(rejected);
	return items.map(toItem);
}
