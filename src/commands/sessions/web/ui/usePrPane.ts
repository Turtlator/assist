import { useMemo } from "react";
import type { PrDecisionDetails } from "./PrDecisionDetails";
import { previewHighlights } from "./previewHighlights";
import { usePaneScreenshots } from "./usePaneScreenshots";
import { usePrComments } from "./usePrComments";
import { usePrDecision } from "./usePrDecision";
import { usePreviewSelection } from "./usePreviewSelection";

type OnDecision = (
	decision: "approve" | "reject",
	details: PrDecisionDetails,
) => void;

export function usePrPane(
	requestId: string,
	sessionId: string | undefined,
	cwd: string | undefined,
	onDecision: OnDecision,
	isPr: boolean,
) {
	const { wrapperRef, contentRef, pending, dragRects, onMouseDown, clear } =
		usePreviewSelection();
	const { comments, add, remove } = usePrComments(requestId);
	const shots = usePaneScreenshots(cwd, isPr);
	const decision = usePrDecision(requestId, sessionId, onDecision, isPr, () =>
		shots.screenshots.map((s) => s.markdown),
	);

	const { commentColors, dragColor, ranges } = useMemo(
		() => previewHighlights(comments, pending),
		[comments, pending],
	);

	const onAdd = (note: string) => {
		if (pending)
			add({
				quote: pending.quote,
				note,
				start: pending.start,
				end: pending.end,
			});
		clear();
	};

	return {
		wrapperRef,
		contentRef,
		onMouseDown,
		comments,
		commentColors,
		remove,
		pending,
		ranges,
		dragRects,
		dragColor,
		onAdd,
		onCancel: clear,
		onDecide: decision.onDecide,
		chain: decision.chain,
		setChain: decision.setChain,
		...shots,
	};
}
