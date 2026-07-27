import { useState } from "react";
import { type OverlayRect, overlayRects } from "./caretFromPoint";
import { type DiffSelection, finishDiffSelection } from "./finishDiffSelection";
import { snappedRange } from "./finishSelection";
import { useDragSelection } from "./useDragSelection";

export function useDiffSelection() {
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
			const next = finishDiffSelection(anchor, focus, wrapper);
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
