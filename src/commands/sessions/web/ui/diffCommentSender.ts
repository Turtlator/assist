import { bracketedPasteSubmit } from "./bracketedPasteSubmit";
import { type DiffComment, formatDiffComment } from "./formatDiffComment";
import type { SessionInfo } from "./types";

export function diffCommentSender(
	sessions: SessionInfo[],
	claudeSessionId: string | undefined,
	sendInput: (sessionId: string, data: string) => void,
): ((comment: DiffComment) => void) | undefined {
	if (!claudeSessionId) return undefined;
	const target = sessions.find((s) => s.claudeSessionId === claudeSessionId);
	if (!target) return undefined;
	return (comment) =>
		sendInput(target.id, bracketedPasteSubmit(formatDiffComment(comment)));
}
