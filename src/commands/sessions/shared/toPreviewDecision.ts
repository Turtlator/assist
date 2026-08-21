import type { PreviewDecision } from "./PreviewDecision";
import type { PrPreviewComment } from "./SessionInfoBase";

export type DecisionMessage = {
	type?: string;
	requestId?: string;
	decision?: string;
	reason?: string;
	comments?: PrPreviewComment[];
	screenshots?: string[];
	body?: string;
	reviewAfter?: boolean;
	announceAfter?: boolean;
	draft?: boolean;
	message?: string;
};

export function toPreviewDecision(
	msg: DecisionMessage,
): PreviewDecision | null {
	if (msg.decision !== "approve" && msg.decision !== "reject") return null;
	return {
		decision: msg.decision,
		reason: msg.reason,
		comments: Array.isArray(msg.comments) ? msg.comments : undefined,
		screenshots: Array.isArray(msg.screenshots) ? msg.screenshots : undefined,
		body: typeof msg.body === "string" ? msg.body : undefined,
		reviewAfter: msg.reviewAfter === true,
		announceAfter: msg.announceAfter === true,
		draft: typeof msg.draft === "boolean" ? msg.draft : undefined,
	};
}
