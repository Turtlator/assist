import type { SessionStatus } from "./types";

export function sessionBase(id: string, status: SessionStatus) {
	const startedAt = Date.now();
	return {
		id,
		status,
		startedAt,
		runningMs: 0,
		/* why: runningMs counts only running stretches, so a session that starts
		 * waiting (idle, awaiting first input) has no open stretch to stamp. */
		runningSince: status === "running" ? startedAt : null,
		waitingSince: status === "waiting" ? startedAt : null,
		scrollback: "",
	};
}
