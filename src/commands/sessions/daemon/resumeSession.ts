import { resolveHarness } from "../../../shared/harnessLabel";
import type { HarnessKind } from "../../../shared/harnesses";
import type { Session } from "./createSession";
import { spawnClaude } from "./spawnClaude";
import { spawnCodex } from "./spawnCodex";
import { startOrHoldPty } from "./startOrHoldPty";

export function resumeSession(
	id: string,
	sessionId: string,
	cwd: string,
	name?: string,
	holdPty?: boolean,
	harness?: HarnessKind,
): Session {
	const startedAt = Date.now();
	const codex = resolveHarness(harness) === "codex";
	return {
		id,
		name: name ? `${name.slice(0, 36)} (R)` : `Resume ${sessionId.slice(0, 8)}`,
		commandType: "claude",
		harness,
		status: "waiting",
		startedAt,
		runningMs: 0,
		runningSince: null,
		waitingSince: startedAt,
		...startOrHoldPty(
			() =>
				codex
					? spawnCodex({ resumeSessionId: sessionId, cwd, sessionId: id })
					: spawnClaude({ resumeSessionId: sessionId, cwd, sessionId: id }),
			holdPty,
		),
		scrollback: "",
		cwd,
		/* why: bind the card to the conversation it is resuming so a daemon restart
		 * re-resumes this same transcript, not whichever .jsonl a cwd poller would
		 * have re-discovered (#413). */
		claudeSessionId: codex ? undefined : sessionId,
		harnessSessionId: codex ? sessionId : undefined,
	};
}
