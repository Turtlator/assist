import { useState } from "react";
import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import { clearPersistedComments } from "./PersistedComment";
import type { PrDecisionDetails } from "./PrDecisionDetails";

type OnDecision = (
	decision: "approve" | "reject",
	details: PrDecisionDetails,
) => void;

export function usePrDecision(
	requestId: string,
	onDecision: OnDecision,
	isPr: boolean,
	screenshotMarkdown: () => string[],
) {
	const [reviewAfter, setReviewAfter] = useState(isPr);

	const onDecide = (
		decision: "approve" | "reject",
		comments: PrPreviewComment[],
	) => {
		const approved = decision === "approve";
		clearPersistedComments(requestId);
		onDecision(decision, {
			comments,
			screenshots: approved ? screenshotMarkdown() : [],
			reviewAfter: approved && reviewAfter,
		});
	};

	return { reviewAfter, setReviewAfter, onDecide };
}
