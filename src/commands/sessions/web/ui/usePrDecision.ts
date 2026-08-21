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
import { previewDecisionDetails } from "./previewDecisionDetails";

type OnDecision = (
	decision: "approve" | "reject",
	details: PrDecisionDetails,
) => void;

export function usePrDecision(
	requestId: string,
	sessionId: string | undefined,
	onDecision: OnDecision,
	isPr: boolean,
	resolvedDraft: boolean,
	screenshotMarkdown: () => string[],
	editedBody: () => string | undefined,
) {
	const [chain, setChain] = useState<PrPreviewChain>(() => {
		if (!isPr)
			return { reviewAfter: false, announceAfter: false, draft: false };
		prunePersistedPrChains();
		const saved = loadPersistedPrChain(sessionId);
		return {
			reviewAfter: saved?.reviewAfter ?? true,
			announceAfter: saved?.announceAfter ?? true,
			draft: saved?.draft ?? resolvedDraft,
		};
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
		onDecision(
			decision,
			previewDecisionDetails(
				approved,
				comments,
				chain,
				approved ? screenshotMarkdown() : [],
				editedBody(),
			),
		);
	};

	return { chain, setChain: chooseChain, onDecide };
}
