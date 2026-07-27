import { useState } from "react";
import type { DiffChangeIndex } from "./buildChangeIndex";
import { type OverlayRect, overlayRects } from "./caretFromPoint";
import { type DiffSelection, finishDiffSelection } from "./finishDiffSelection";
import { snappedRange } from "./finishSelection";
import { useDragSelection } from "./useDragSelection";

export function useDiffSelection(index: DiffChangeIndex) {
	const [pending, setPending] = useState<DiffSelection | null>(null);
	const [rects, setRects] = useState<OverlayRect[] | null>(null);

	const { wrapperRef, contentRef, onMouseDown } = useDragSelection({
		onStart: () => {
			setPending(null);
			setRects([]);
		},
		onMove: (anchor, focus, { wrapper }) =>
			setRects(overlayRects(snappedRange(anchor, focus), wrapper)),
		onEnd: (anchor, focus, { wrapper }) => {
			const next = finishDiffSelection(anchor, focus, wrapper, index);
			setPending(next);
			setRects(next?.rects ?? null);
		},
	});

	const clear = () => {
		setPending(null);
		setRects(null);
	};

	return { wrapperRef, contentRef, pending, rects, onMouseDown, clear };
}
