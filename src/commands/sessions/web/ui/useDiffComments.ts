import { useState } from "react";
import { diffCommentSender } from "./diffCommentSender";
import { diffCommentTarget } from "./diffCommentTarget";
import type { DiffComment } from "./formatDiffComment";
import type { SessionInfo } from "./types";

export function useDiffComments(
	sessions: SessionInfo[],
	claudeSessionId: string | undefined,
	sendInput: (sessionId: string, data: string) => void,
): {
	onComment?: (comment: DiffComment) => void;
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
		unavailable,
		sentTo,
		clearSent: () => setSentTo(null),
	};
}
