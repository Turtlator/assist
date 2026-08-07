import { useState } from "react";
import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import { clearPersistedComments } from "./PersistedComment";
import {
	clearPersistedPrChain,
	loadPersistedPrChain,
	prunePersistedPrChains,
	savePersistedPrChain,
} from "./loadPersistedPrChain";
import type { PrDecisionDetails } from "./PrDecisionDetails";
import type { PrPreviewChain } from "./PrPreviewChain";

type OnDecision = (
	decision: "approve" | "reject",
	details: PrDecisionDetails,
) => void;

export function usePrDecision(
	requestId: string,
	sessionId: string | undefined,
	onDecision: OnDecision,
	isPr: boolean,
	screenshotMarkdown: () => string[],
) {
	const [chain, setChain] = useState<PrPreviewChain>(() => {
		if (!isPr) return { reviewAfter: false, announceAfter: false };
		prunePersistedPrChains();
		return (
			loadPersistedPrChain(sessionId) ?? {
				reviewAfter: true,
				announceAfter: true,
			}
		);
	});

	const chooseChain = (next: PrPreviewChain) => {
		setChain(next);
		savePersistedPrChain(sessionId, next);
	};

	const onDecide = (
		decision: "approve" | "reject",
		comments: PrPreviewComment[],
	) => {
		const approved = decision === "approve";
		clearPersistedComments(requestId);
		if (approved) clearPersistedPrChain(sessionId);
		onDecision(decision, {
			comments,
			screenshots: approved ? screenshotMarkdown() : [],
			reviewAfter: approved && chain.reviewAfter,
			announceAfter: approved && chain.announceAfter,
		});
	};

	return { chain, setChain: chooseChain, onDecide };
}
