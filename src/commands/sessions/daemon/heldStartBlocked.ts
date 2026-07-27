import { daemonLog } from "./daemonLog";
import type { Session } from "./types";

export function heldStartBlocked(
	session: Session,
	sessions: Map<string, Session>,
): boolean {
	const where = session.worktree?.path ?? "no worktree";
	if (sessions.get(session.id) !== session) {
		daemonLog(
			`session ${session.id} not started after seeding: card is gone (${where})`,
		);
		return true;
	}
	if (session.closing) {
		daemonLog(
			`session ${session.id} not started after seeding: card is closing (${where})`,
		);
		return true;
	}
	return false;
}
