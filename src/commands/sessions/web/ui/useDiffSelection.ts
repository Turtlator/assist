import { useState } from "react";
import { type DiffSelection, finishDiffSelection } from "./finishDiffSelection";
import { useDragSelection } from "./useDragSelection";

export function useDiffSelection() {
	const [pending, setPending] = useState<DiffSelection | null>(null);

	const { wrapperRef, contentRef, onMouseDown } = useDragSelection({
		onStart: () => setPending(null),
		onEnd: (anchor, focus) => setPending(finishDiffSelection(anchor, focus)),
	});

	const clear = () => setPending(null);

	return { wrapperRef, contentRef, pending, onMouseDown, clear };
}
