import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { OnStatusChange } from "./types";
import { watchTranscript } from "./watchTranscript";

/* why: /clear abandons the conversation id the session was spawned with and
 * starts a fresh transcript, so the watcher bound at spawn time would sit on a
 * file that never changes again — freezing the last message and the
 * transcript-derived status. Claude Code hooks report the live conversation id,
 * which is the only signal that the move happened. */
export function rebindClaudeSession(
	session: Session,
	claudeSessionId: string | undefined,
	notify: () => void,
	onStatusChange: OnStatusChange,
): void {
	if (!claudeSessionId) return;
	if (session.claudeSessionId === claudeSessionId) return;
	daemonLog(
		`session ${session.id} claude session moved: ${session.claudeSessionId ?? "none"} -> ${claudeSessionId}`,
	);
	session.claudeSessionId = claudeSessionId;
	watchTranscript(session, notify, onStatusChange);
}
