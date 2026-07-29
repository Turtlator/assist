import { useState } from "react";
import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import { clearPersistedComments } from "./PersistedComment";
import type { PrDecisionDetails } from "./PrDecisionDetails";
import type { PrPreviewChain } from "./PrPreviewChain";

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
	const [chain, setChain] = useState<PrPreviewChain>({
		reviewAfter: isPr,
		announceAfter: isPr,
	});

	const onDecide = (
		decision: "approve" | "reject",
		comments: PrPreviewComment[],
	) => {
		const approved = decision === "approve";
		clearPersistedComments(requestId);
		onDecision(decision, {
			comments,
			screenshots: approved ? screenshotMarkdown() : [],
			reviewAfter: approved && chain.reviewAfter,
			announceAfter: approved && chain.announceAfter,
		});
	};

	return { chain, setChain, onDecide };
}
