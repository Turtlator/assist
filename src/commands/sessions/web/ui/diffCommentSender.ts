import { bracketedPaste, SUBMIT } from "./bracketedPaste";
import { type DiffComment, formatDiffComment } from "./formatDiffComment";
import type { SessionInfo } from "./types";

const SUBMIT_DELAY_MS = 150;

export function diffCommentSender(
	session: SessionInfo,
	sendInput: (sessionId: string, data: string) => void,
	onSent: () => void,
): (comment: DiffComment) => void {
	return (comment) => {
		sendInput(session.id, bracketedPaste(formatDiffComment(comment)));
		setTimeout(() => sendInput(session.id, SUBMIT), SUBMIT_DELAY_MS);
		onSent();
	};
}
