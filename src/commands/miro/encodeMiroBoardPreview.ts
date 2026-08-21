import { isBox } from "./isBox";
import type { MiroBoardPreview, MiroItem } from "./types";

export function encodeMiroBoardPreview(items: MiroItem[]): string {
	const preview: MiroBoardPreview = { boxes: items.filter(isBox) };
	return JSON.stringify(preview);
}
