import { type Caret, type OverlayRect, overlayRects } from "./caretFromPoint";
import { changeKeyLine } from "./changeKeyLine";
import { snappedRange } from "./finishSelection";
import type { SelectionAnchor } from "./SelectionCommentPopover";

export type DiffSelection = SelectionAnchor & {
	startLine: number;
	endLine: number;
	rects: OverlayRect[];
};

function lineOf(node: Node): number | null {
	const el = node instanceof Element ? node : node.parentElement;
	return changeKeyLine(
		el?.closest("[data-change-key]")?.getAttribute("data-change-key"),
	);
}

export function finishDiffSelection(
	anchor: Caret,
	focus: Caret,
	wrapper: HTMLElement,
): DiffSelection | null {
	const range = snappedRange(anchor, focus);
	const quote = range.toString().trim();
	if (!quote) return null;
	const startLine = lineOf(range.startContainer);
	const endLine = lineOf(range.endContainer) ?? startLine;
	if (startLine === null || endLine === null) return null;
	const rect = range.getBoundingClientRect();
	return {
		quote,
		startLine,
		endLine,
		top: rect.bottom,
		left: rect.left,
		rects: overlayRects(range, wrapper),
	};
}
