import type { Session } from "./createSession";
import { spawnClaude } from "./spawnClaude";
import { startOrHoldPty } from "./startOrHoldPty";

export function resumeSession(
	id: string,
	sessionId: string,
	cwd: string,
	name?: string,
	holdPty?: boolean,
): Session {
	const startedAt = Date.now();
	return {
		id,
		name: name ? `${name.slice(0, 36)} (R)` : `Resume ${sessionId.slice(0, 8)}`,
		commandType: "claude",
		status: "waiting",
		startedAt,
		runningMs: 0,
		runningSince: null,
		waitingSince: startedAt,
		...startOrHoldPty(
			() => spawnClaude({ resumeSessionId: sessionId, cwd, sessionId: id }),
			holdPty,
		),
		scrollback: "",
		cwd,
		/* why: bind the card to the conversation it is resuming so a daemon restart
		 * re-resumes this same transcript, not whichever .jsonl a cwd poller would
		 * have re-discovered (#413). */
		claudeSessionId: sessionId,
	};
}
