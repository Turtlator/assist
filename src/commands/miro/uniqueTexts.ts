import type { MiroItem } from "./types";

export function uniqueTexts(boxes: MiroItem[]): string[] {
	return [...new Set(boxes.map((box) => box.text))];
}
