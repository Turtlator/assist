import type { MiroItem } from "./types";

const boxTypes = new Set(["shape", "sticky_note"]);

export function isBox(item: MiroItem): boolean {
	return boxTypes.has(item.type) && item.text.length > 0;
}
