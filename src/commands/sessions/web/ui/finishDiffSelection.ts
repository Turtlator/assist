import type { DiffChangeIndex } from "./buildChangeIndex";
import { type Caret, type OverlayRect, overlayRects } from "./caretFromPoint";
import { snappedRange } from "./finishSelection";
import { resolveDiffRange } from "./resolveDiffRange";
import type { SelectionAnchor } from "./SelectionCommentPopover";

export type DiffSelection = SelectionAnchor & {
	startLine: number;
	endLine: number;
	rects: OverlayRect[];
};

export function finishDiffSelection(
	anchor: Caret,
	focus: Caret,
	wrapper: HTMLElement,
	index: DiffChangeIndex,
): DiffSelection | null {
	const range = snappedRange(anchor, focus);
	const resolved = resolveDiffRange(range, index);
	if (!resolved) return null;
	const rect = range.getBoundingClientRect();
	return {
		...resolved,
		top: rect.bottom,
		left: rect.left,
		rects: overlayRects(range, wrapper),
	};
}
