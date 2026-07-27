import { bracketedPaste, SUBMIT } from "./bracketedPaste";
import { type DiffComment, formatDiffComment } from "./formatDiffComment";
import type { SessionInfo } from "./types";

const SUBMIT_DELAY_MS = 150;

export function diffCommentSender(
	sessions: SessionInfo[],
	claudeSessionId: string | undefined,
	sendInput: (sessionId: string, data: string) => void,
): ((comment: DiffComment) => void) | undefined {
	if (!claudeSessionId) return undefined;
	const target = sessions.find((s) => s.claudeSessionId === claudeSessionId);
	if (!target) return undefined;
	return (comment) => {
		sendInput(target.id, bracketedPaste(formatDiffComment(comment)));
		setTimeout(() => sendInput(target.id, SUBMIT), SUBMIT_DELAY_MS);
	};
}
