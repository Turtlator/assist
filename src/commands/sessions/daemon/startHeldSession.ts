import type { SessionClient } from "./broadcast";
import { daemonLog } from "./daemonLog";
import type { OnStatusChange, Session } from "./types";
import { wirePtyEvents } from "./wirePtyEvents";

export function startHeldSession(
	session: Session,
	sessions: Map<string, Session>,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
	notify: () => void,
): void {
	const start = session.pendingStart;
	if (!start) return;
	session.pendingStart = undefined;
	if (sessions.get(session.id) !== session) {
		daemonLog(
			`session ${session.id} not started after seeding: card is gone (${session.worktree?.path ?? "no worktree"})`,
		);
		return;
	}
	if (session.closing) {
		daemonLog(
			`session ${session.id} not started after seeding: card is closing (${session.worktree?.path ?? "no worktree"})`,
		);
		return;
	}
	session.startedAt = Date.now();
	if (session.status === "running") session.runningSince = session.startedAt;
	session.pty = start();
	if (session.cols && session.rows)
		try {
			session.pty?.resize(session.cols, session.rows);
		} catch {}
	wirePtyEvents(session, clients, onStatusChange);
	daemonLog(
		`session ${session.id} started once worktree ${session.worktree?.path ?? session.cwd} finished seeding`,
	);
	notify();
}
