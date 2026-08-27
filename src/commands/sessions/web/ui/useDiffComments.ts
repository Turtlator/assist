import { useState } from "react";
import { addRuleSender } from "./addRuleSender";
import { diffCommentSender } from "./diffCommentSender";
import { diffCommentTarget } from "./diffCommentTarget";
import type { AddRuleRequest } from "./formatAddRuleCommand";
import type { DiffComment } from "./formatDiffComment";
import type { SessionInfo } from "./types";

export function useDiffComments(
	sessions: SessionInfo[],
	claudeSessionId: string | undefined,
	sendInput: (sessionId: string, data: string) => void,
): {
	onComment?: (comment: DiffComment) => void;
	onAddRule?: (request: AddRuleRequest) => void;
	unavailable?: string;
	sentTo: string | null;
	clearSent: () => void;
} {
	const [sentTo, setSentTo] = useState<string | null>(null);
	const { session, unavailable } = diffCommentTarget(sessions, claudeSessionId);

	return {
		onComment: session
			? diffCommentSender(session, sendInput, () => setSentTo(session.name))
			: undefined,
		onAddRule: session
			? addRuleSender(session, sendInput, () => setSentTo(session.name))
			: undefined,
		unavailable,
		sentTo,
		clearSent: () => setSentTo(null),
	};
}
